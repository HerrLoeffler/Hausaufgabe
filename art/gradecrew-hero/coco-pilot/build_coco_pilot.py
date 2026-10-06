"""GC-DESIGN-05 / Coco pilot. Run with Blender's bundled Python.

Only the GC_CocoPilot collection is replaced. No reference bitmap is used in
materials: the character, fur, door and room are editable local geometry.
"""
import argparse
import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector, Matrix

HERE = Path(__file__).resolve().parent
COLLECTION = "GC_CocoPilot"
SEED = 20261006
RNG = random.Random(SEED)


def arguments():
    tail = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--render", choices=("desktop", "inspection", "mobile", "poses", "all", "none"), default="desktop")
    parser.add_argument("--samples", type=int, default=32)
    parser.add_argument("--engine", choices=("CYCLES", "BLENDER_EEVEE"), default="CYCLES")
    parser.add_argument("--output", type=Path, default=HERE)
    return parser.parse_args(tail)


def clear_owned():
    old = bpy.data.collections.get(COLLECTION)
    data_to_remove = []
    materials_to_remove = []
    if old:
        for obj in list(old.all_objects):
            if obj.data is not None:
                data_to_remove.append(obj.data)
                if hasattr(obj.data,"materials"):
                    materials_to_remove.extend(m for m in obj.data.materials if m)
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(old)
    owned_names={block.name for block in data_to_remove+materials_to_remove}
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.name in owned_names and block.users == 0:
                datablocks.remove(block)
    collection = bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(collection)
    return collection


def owned(obj):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    GC.objects.link(obj)
    return obj


def material(name, color, roughness=.5, metallic=0):
    m = bpy.data.materials.new("GC_" + name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = roughness
    bs.inputs["Metallic"].default_value = metallic
    return m


def math_node(nt, operation, a=None, b=None):
    node = nt.nodes.new("ShaderNodeMath")
    node.operation = operation
    for i, value in enumerate((a, b)):
        if value is not None:
            if hasattr(value, "bl_idname") or hasattr(value, "is_output"):
                nt.links.new(value, node.inputs[i])
            else:
                node.inputs[i].default_value = value
    return node.outputs[0]


def ellipse_shader(nt, x, z, cx, cz, rx, rz, angle=0):
    dx = math_node(nt, "SUBTRACT", x, cx)
    dz = math_node(nt, "SUBTRACT", z, cz)
    ux = math_node(nt, "ADD", math_node(nt, "MULTIPLY", dx, math.cos(angle)), math_node(nt, "MULTIPLY", dz, math.sin(angle)))
    uz = math_node(nt, "ADD", math_node(nt, "MULTIPLY", dz, math.cos(angle)), math_node(nt, "MULTIPLY", dx, -math.sin(angle)))
    ex = math_node(nt, "DIVIDE", ux, rx)
    ez = math_node(nt, "DIVIDE", uz, rz)
    d = math_node(nt, "ADD", math_node(nt, "MULTIPLY", ex, ex), math_node(nt, "MULTIPLY", ez, ez))
    # Narrow softened boundary prevents a polygon seam without a broad grey halo.
    return math_node(nt, "MULTIPLY", math_node(nt, "SUBTRACT", 1.025, d), 40)


def feather_material(name, head=False):
    m = material(name, (.005, .013, .046), .72)
    nt = m.node_tree
    bs = nt.nodes.get("Principled BSDF")
    bs.inputs["Sheen Weight"].default_value = 0
    bs.inputs["Sheen Roughness"].default_value = .7
    bs.inputs["Specular IOR Level"].default_value = .15
    tex = nt.nodes.new("ShaderNodeTexCoord")
    xyz = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tex.outputs["Generated"], xyz.inputs[0])
    # Generated coordinates normalized across the controlled main surface.
    x = math_node(nt, "SUBTRACT", math_node(nt, "MULTIPLY", xyz.outputs["X"], 2), 1)
    z = xyz.outputs["Z"]
    if head:
        left = ellipse_shader(nt, x, z, -.43, .51, .37, .42, -.15)
        right = ellipse_shader(nt, x, z, .43, .51, .37, .42, .15)
        lower = ellipse_shader(nt, x, z, 0, .25, .78, .31)
        mask = math_node(nt, "MAXIMUM", math_node(nt, "MAXIMUM", left, right), lower)
    else:
        mask = ellipse_shader(nt, x, z, 0, .43, .90, .61)
    front = math_node(nt, "MINIMUM", math_node(nt, "MAXIMUM", math_node(nt, "MULTIPLY", math_node(nt,"SUBTRACT",.53,xyz.outputs["Y"]),18),0),1)
    mask = math_node(nt, "MULTIPLY", mask, front)
    mask = math_node(nt, "MINIMUM", math_node(nt, "MAXIMUM", mask, 0), 1)
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.inputs[1].default_value = (.005, .013, .046, 1)
    mix.inputs[2].default_value = (.91, .80, .59, 1)
    nt.links.new(mask, mix.inputs[0])
    if head:
        # Blush belongs to the same curved face surface, never a protruding disc.
        blush_l = ellipse_shader(nt,x,z,-.61,.425,.19,.095)
        blush_r = ellipse_shader(nt,x,z,.61,.425,.19,.095)
        blush = math_node(nt,"MAXIMUM",blush_l,blush_r)
        blush = math_node(nt,"MINIMUM",math_node(nt,"MAXIMUM",math_node(nt,"DIVIDE",blush,40),0),1)
        blush = math_node(nt,"MULTIPLY",math_node(nt,"MULTIPLY",blush,blush),.30)
        blush = math_node(nt,"MULTIPLY",blush,mask)
        bm=nt.nodes.new("ShaderNodeMixRGB")
        nt.links.new(blush,bm.inputs[0])
        nt.links.new(mix.outputs[0],bm.inputs[1])
        bm.inputs[2].default_value=(.96,.44,.28,1)
        nt.links.new(bm.outputs[0],bs.inputs["Base Color"])
    else:
        nt.links.new(mix.outputs[0], bs.inputs["Base Color"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 155
    noise.inputs["Detail"].default_value = 2
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = .20
    bump.inputs["Distance"].default_value = .012
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs[0], bs.inputs["Normal"])
    return m


def mesh(name, vertices, faces, mat, sub=0):
    data = bpy.data.meshes.new("GC_" + name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new("GC_" + name, data)
    GC.objects.link(obj)
    if mat:
        data.materials.append(mat)
    for p in data.polygons:
        p.use_smooth = True
    if sub:
        mod = obj.modifiers.new("GC_SmoothSurface", "SUBSURF")
        mod.levels = sub
        mod.render_levels = sub
    return obj


def uv_form(name, center, scale, mat, deform=None, seg=64, rings=40):
    vertices = []
    for j in range(rings + 1):
        phi = math.pi * j / rings
        for i in range(seg):
            theta = 2 * math.pi * i / seg
            q = Vector((math.sin(phi) * math.cos(theta), math.sin(phi) * math.sin(theta), math.cos(phi)))
            if deform:
                q = deform(q)
            vertices.append(tuple(Vector(center) + Vector((q.x*scale[0], q.y*scale[1], q.z*scale[2]))))
    faces = []
    for j in range(rings):
        for i in range(seg):
            a = j*seg+i
            b = j*seg+(i+1)%seg
            faces.append((a, a+seg, b+seg, b))
    return mesh(name, vertices, faces, mat)


def sphere(name, loc, scale, mat, parent=None):
    obj = uv_form(name, (0, 0, 0), scale, mat, seg=40, rings=28)
    obj.location = loc
    if parent:
        obj.parent = parent
    return obj


def cube(name, loc, scale, mat, bevel=.04, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = owned(bpy.context.object)
    obj.name = "GC_" + name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("GC_SoftEdges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    if parent:
        obj.parent = parent
    return obj


def empty(name, loc, parent=None):
    obj = bpy.data.objects.new("GC_" + name, None)
    GC.objects.link(obj)
    obj.empty_display_type = "SPHERE"
    obj.empty_display_size = .11
    obj.location = loc
    if parent:
        obj.parent = parent
    return obj


def parent_keep(obj, parent):
    bpy.context.view_layer.update()
    obj.parent = parent
    # Keep existing source coordinates and basis; initial parent placement is
    # canceled, while subsequent control transforms rotate around its pivot.
    obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj


def curve(name, points, mat, radius=.008, parent=None):
    data = bpy.data.curves.new("GC_" + name, "CURVE")
    data.dimensions = "3D"
    data.resolution_u = 12
    data.bevel_depth = radius
    data.bevel_resolution = 2
    spline = data.splines.new("BEZIER")
    spline.bezier_points.add(len(points)-1)
    for p, co in zip(spline.bezier_points, points):
        p.co = co
        p.handle_left_type = "AUTO"
        p.handle_right_type = "AUTO"
    obj = bpy.data.objects.new("GC_" + name, data)
    GC.objects.link(obj)
    data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def patch_is_cream(point, head=False):
    x, y, z = point
    if head:
        xx = x/.91
        zz = (z-1.62)/1.50
        def ell(cx, cz, rx, rz, a=0):
            dx, dz = xx-cx, zz-cz
            u = dx*math.cos(a)+dz*math.sin(a)
            v = dz*math.cos(a)-dx*math.sin(a)
            return (u/rx)**2+(v/rz)**2 < .96
        return y < -.20 and (ell(-.43,.51,.37,.42,-.15) or ell(.43,.51,.37,.42,.15) or ell(0,.25,.78,.31))
    return y < -.25 and (x/(.78*.90))**2+(((z-.12)/1.87-.43)/.61)**2 < .96


def fur(obj, count, head=False, navy_only=False, length=.021):
    """Stable seeded curved micro-strands; no particle-system version dependency."""
    data = obj.data
    # Sampling input quads as triangles keeps fur attached to actual custom surface.
    triangles, cumulative = [], []
    area = 0
    for poly in data.polygons:
        indices = list(poly.vertices)
        for j in range(1, len(indices)-1):
            ids = (indices[0], indices[j], indices[j+1])
            a, b, c = (data.vertices[i].co.copy() for i in ids)
            ar = (b-a).cross(c-a).length/2
            if ar > 1e-8:
                area += ar
                cumulative.append(area)
                triangles.append((a, b, c, (b-a).cross(c-a).normalized()))
    import bisect
    buckets = {False: [], True: []}
    for _ in range(count):
        a, b, c, normal = triangles[bisect.bisect_left(cumulative, RNG.random()*area)]
        u, v = RNG.random(), RNG.random()
        if u+v > 1:
            u, v = 1-u, 1-v
        p = a+(b-a)*u+(c-a)*v
        # UV winding may face inward at poles, ensure outward for main shape.
        center = Vector((0,0,2.37 if head else 1.055)) if obj.name in ("GC_HeadSurface", "GC_BodySurface") else sum((v.co for v in data.vertices), Vector()) / len(data.vertices)
        if normal.dot(p-center) < 0:
            normal.negate()
        cream = False if navy_only else patch_is_cream(p, head)
        ln = length*RNG.uniform(.65,1.25)
        if head and p.y < -.30:
            ln *= .52
        tangent = Vector((RNG.uniform(-.15,.15),RNG.uniform(-.15,.15),-.50))
        tangent -= normal*tangent.dot(normal)
        pts = (p+normal*.0007, p+normal*ln*.55+tangent*ln*.25, p+normal*ln+tangent*ln*.55)
        buckets[cream].append(pts)
    objects = []
    for cream, strands in buckets.items():
        if not strands:
            continue
        name = obj.name + ("_IvoryDown" if cream else "_NavyDown")
        curves = bpy.data.curves.new(name, "CURVE")
        curves.dimensions = "3D"
        curves.bevel_depth = .00165 if head else .0019
        curves.bevel_resolution = 0
        curves.resolution_u = 1
        for pts in strands:
            spline = curves.splines.new("POLY")
            spline.points.add(2)
            for p, co in zip(spline.points, pts):
                p.co = (*co,1)
                p.radius = 1 if p == spline.points[0] else .62
            spline.points[-1].radius = .15
        hair = bpy.data.objects.new(name, curves)
        GC.objects.link(hair)
        curves.materials.append(CREAM_FUR if cream else NAVY_FUR)
        objects.append(hair)
    return objects


def loft(name, centers, widths, thicknesses, mat, axis="Y", segments=24):
    vertices=[]
    for j,(center, width, thickness) in enumerate(zip(centers, widths, thicknesses)):
        prev=Vector(centers[max(0,j-1)])
        nxt=Vector(centers[min(len(centers)-1,j+1)])
        tangent=(nxt-prev).normalized()
        hint=Vector((1,0,0))
        u=(hint-tangent*hint.dot(tangent)).normalized()
        v=tangent.cross(u).normalized()
        for i in range(segments):
            a=2*math.pi*i/segments
            off=u*math.cos(a)*width+v*math.sin(a)*thickness
            vertices.append(tuple(Vector(center)+off))
    faces=[]
    for j in range(len(centers)-1):
        for i in range(segments):
            faces.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
    faces += [tuple(reversed(range(segments))), tuple((len(centers)-1)*segments+i for i in range(segments))]
    return mesh(name,vertices,faces,mat,1)


def upper_beak():
    rings=[(-.54,.13,2.22,.10),(-.60,.21,2.225,.165),(-.70,.25,2.218,.135),(-.80,.13,2.215,.061),(-.865,.006,2.21,.004)]
    verts=[]
    n=32
    for y,w,z,h in rings:
        for i in range(n):
            a=2*math.pi*i/n
            s=math.sin(a)
            dz=s*s*h if s>=0 else s*.025
            verts.append((math.cos(a)*w,y,z+dz))
    faces=[]
    for j in range(len(rings)-1):
        for i in range(n):
            faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    faces += [tuple(reversed(range(n))),tuple((len(rings)-1)*n+i for i in range(n))]
    return mesh("UpperBeak",verts,faces,ORANGE,2)


def mouth_bowl():
    # A shallow concave opening within the beak, not a protruding dark sphere.
    verts=[]
    n=48
    for j in range(9):
        r=j/8
        for i in range(n):
            a=2*math.pi*i/n
            verts.append((.211*r*math.cos(a),-.653-.054*r*r,2.124+.135*r*math.sin(a)))
    faces=[]
    for j in range(8):
        for i in range(n):
            faces.append((j*n+i,(j+1)*n+i,(j+1)*n+(i+1)%n,j*n+(i+1)%n))
    return mesh("SmileCavity",verts,faces,MOUTH)


def build_coco():
    root=empty("CTRL_CocoRoot",(0,0,0))
    head_ctrl=empty("CTRL_HeadTurn",(0,0,2.12),root)
    bpy.context.view_layer.update()
    def body_shape(q):
        # Pear silhouette: broad lower belly, tapering shoulders, flat-ish soles.
        width = 1.0-.20*max(q.z,0)+.06*max(-q.z,0)
        return Vector((q.x*width,q.y*(1-.10*max(q.z,0)),q.z))
    body=uv_form("BodySurface",(0,.06,1.055),(.78,.58,.935),BODY_MAT,body_shape)
    body.parent=root
    for obj in fur(body,13500,length=.022):
        obj.parent=root
    def head_shape(q):
        return Vector((q.x*(1-.11*max(-q.z,0)),q.y*(1-.10*max(-q.z,0)),q.z))
    head=uv_form("HeadSurface",(0,-.015,2.37),(.91,.665,.75),HEAD_MAT,head_shape)
    parent_keep(head,head_ctrl)
    for obj in fur(head,18500,head=True,length=.021):
        parent_keep(obj,head_ctrl)
    # Eyes sit in the face surface; individual light flecks follow blink/turn.
    for side in (-1,1):
        x=side*.365
        eye_ctrl=empty("CTRL_Blink_"+("L" if side<0 else "R"),(x,-.598,2.505))
        eye_ctrl.rotation_euler=(-.21,0,side*.42)
        parent_keep(eye_ctrl,head_ctrl)
        sphere("EyeIvorySclera_"+str(side),(0,.013,0),(.183,.039,.234),EYE_IVORY,eye_ctrl)
        sphere("EyeBrown_"+str(side),(.020,-.019,-.008),(.138,.027,.170),BROWN,eye_ctrl)
        sphere("Pupil_"+str(side),(.020,-.041,-.009),(.106,.009,.132),PUPIL,eye_ctrl)
        sphere("EyeShineMain_"+str(side),(-.017,-.055,.058),(.029,.005,.033),SHINE,eye_ctrl)
        sphere("EyeShinePin_"+str(side),(.061,-.052,-.053),(.011,.004,.012),SHINE,eye_ctrl)
        brow=[]
        for k in range(5):
            t=k/4
            bx=x-.115+.23*t
            bz=2.794+.052*math.sin(math.pi*t)
            by=-.015-.665*math.sqrt(max(.01,1-(bx/.91)**2-((bz-2.37)/.75)**2))-.012
            brow.append((bx,by,bz))
        parent_keep(curve("Brow_"+str(side),brow,BROWN,.013),head_ctrl)
        for frame, scl in ((1,1),(10,1),(12,.08),(14,1),(24,1)):
            eye_ctrl.scale.z=scl
            eye_ctrl.keyframe_insert("scale",frame=frame)
    # Open smile cavity and tongue are behind the rounded tapered upper beak.
    cavity=mouth_bowl()
    parent_keep(cavity,head_ctrl)
    tongue=sphere("SmileTongue",(0,-.706,2.046),(.108,.020,.052),TONGUE)
    parent_keep(tongue,head_ctrl)
    rim=curve("LowerBeakSmile",[(-.222,-.679,2.198),(-.177,-.732,2.064),(0,-.746,1.994),(.177,-.732,2.064),(.222,-.679,2.198)],ORANGE,.035)
    parent_keep(rim,head_ctrl)
    beak=upper_beak()
    parent_keep(beak,head_ctrl)
    # Two broad, tapered flippers. One stays on the fixed door handle.
    contact=loft("FlipperDoor",[(-.52,.02,1.67),(-.66,.10,1.61),(-.85,.28,1.62),(-1.04,.47,1.68),(-1.083,.485,1.68)],[.11,.19,.17,.070,.008],[.10,.115,.090,.045,.008],NAVY_FUR)
    contact.parent=root
    for obj in fur(contact,3300,navy_only=True,length=.019):
        obj.parent=root
    wave_ctrl=empty("CTRL_FlipperWave",(.55,.035,1.69),root)
    bpy.context.view_layer.update()
    wave=loft("FlipperWelcome",[(.53,.04,1.66),(.70,.02,1.72),(.88,.015,1.89),(1.08,.045,2.10),(1.17,.075,2.24)], [.10,.23,.21,.14,.015],[.10,.13,.105,.07,.012],NAVY_FUR)
    parent_keep(wave,wave_ctrl)
    for obj in fur(wave,4200,navy_only=True,length=.019):
        parent_keep(obj,wave_ctrl)
    # Feet have a unified palm with three rounded forward toes; actual floor is z=0.
    for side in (-1,1):
        sphere("CoveredAnkle_"+str(side),(side*.40,-.045,.26),(.116,.134,.128),ORANGE,root)
        foot=sphere("FootPalm_"+str(side),(side*.40,-.08,.134),(.26,.30,.13),ORANGE,root)
        for toe in (-1,0,1):
            sphere("Toe_%s_%s"%(side,toe),(side*.40+toe*.135,-.323-(.02 if toe==0 else 0),.109),(.091,.168,.106),ORANGE,root)
    root.location=(-2.03,-.60,0)
    for frame, angle in ((1,-.06),(12,.10),(24,-.06)):
        head_ctrl.rotation_euler.z=angle
        head_ctrl.keyframe_insert("rotation_euler",frame=frame)
    for frame, angle in ((1,-.03),(12,-.18),(24,.10)):
        wave_ctrl.rotation_euler.y=angle
        wave_ctrl.keyframe_insert("rotation_euler",frame=frame)
    root["identity"]="Coco / navy penguin / dark brown eyes / ivory face and belly / orange feet and beak"
    root["reference"]="penguin-guide.webp; side/back inferred; no bitmap material"
    head_ctrl["purpose"]="Head yaw about neck. Pilot transform rig, not a production facial rig."
    wave_ctrl["purpose"]="Welcome flipper movement; door-side flipper remains fixed."
    return root


def wood_material():
    m=material("WarmOak",(.45,.22,.085),.48)
    nt=m.node_tree
    bs=nt.nodes.get("Principled BSDF")
    tex=nt.nodes.new("ShaderNodeTexCoord")
    mapping=nt.nodes.new("ShaderNodeVectorMath")
    mapping.operation="MULTIPLY"
    mapping.inputs[1].default_value=(7,7,.8)
    nt.links.new(tex.outputs["Generated"],mapping.inputs[0])
    noise=nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value=4
    noise.inputs["Detail"].default_value=3
    noise.inputs["Roughness"].default_value=.7
    nt.links.new(mapping.outputs[0],noise.inputs["Vector"])
    ramp=nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position=.23
    ramp.color_ramp.elements[0].color=(.29,.11,.034,1)
    ramp.color_ramp.elements[1].position=.80
    ramp.color_ramp.elements[1].color=(.68,.40,.17,1)
    nt.links.new(noise.outputs["Fac"],ramp.inputs[0])
    nt.links.new(ramp.outputs[0],bs.inputs["Base Color"])
    bump=nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value=.13
    bump.inputs["Distance"].default_value=.025
    nt.links.new(noise.outputs["Fac"],bump.inputs["Height"])
    nt.links.new(bump.outputs[0],bs.inputs["Normal"])
    return m


def build_room():
    floor=material("FloorMaple",(.54,.37,.20),.64)
    wall=material("PlasterWarm",(.77,.735,.66),.84)
    trim=material("DoorTrim",(.65,.43,.22),.52)
    wood=wood_material()
    brass=material("SatinBrass",(.58,.35,.12),.29,.65)
    # A shallow room, brighter quiet plaster to the right, low-detail furniture.
    cube("Floor",(0,1,-.09),(15,13,.18),floor,.03)
    for y in range(-4,7):
        curve("FloorJoint_%d"%y,[(-7.5,y*.69,.006),(7.5,y*.69,.006)],FLOOR_JOIN,.0028)
    cube("BackWall",(1.25,4.1,5.0),(20,.16,10.0),wall,.02)
    cube("BackSkirting",(1.25,3.985,.19),(12,.10,.34),trim,.02)
    # Door hinge is left; -45 degree swing, panel includes recessed rails.
    hinge=empty("CTRL_DoorHinge",(-4.04,1.0,0))
    hinge.rotation_euler.z=-math.pi/4
    cube("DoorLeaf",(.845,0,2.12),(1.69,.12,4.24),wood,.055,hinge)
    for z,height in ((.91,1.35),(2.73,1.75)):
        cube("DoorInset_%s"%z,(.845,-.071,z),(1.30,.035,height),wood,.036,hinge)
        for x in (.18,1.51):
            cube("DoorVerticalMoulding_%s_%s"%(z,x),(x,-.097,z),(.047,.045,height+.055),trim,.012,hinge)
        for zz in (z-height/2,z+height/2):
            cube("DoorHorizontalMoulding_%s"%zz,(.845,-.097,zz),(1.36,.045,.055),trim,.012,hinge)
    cube("HandleBackplate",(1.42,-.124,1.68),(.10,.032,.40),brass,.035,hinge)
    knob=sphere("DoorKnob",(1.42,-.213,1.68),(.10,.105,.10),brass,hinge)
    for z in (.50,2.05,3.60):
        cube("DoorHinge_%s"%z,(.025,.008,z),(.10,.19,.19),brass,.025,hinge)
    cube("JambLeft",(-4.12,1.05,2.24),(.18,.25,4.48),trim,.025)
    cube("JambRight",(-2.24,1.05,2.24),(.18,.25,4.48),trim,.025)
    cube("JambLintel",(-3.18,1.05,4.41),(2.06,.25,.22),trim,.025)
    cube("WallLeft",(-6.18,1.17,5.0),(3.90,.19,10.0),wall,.02)
    # Doorway luminous view into classroom, no distracting sign or text.
    cube("DoorwayInnerFloor",(-3.17,2.65,-.025),(1.65,3.3,.06),floor,.01)
    cube("DoorwayInnerWall",(-3.18,3.9,2.2),(1.65,.10,4.4),wall,.02)
    # Crew placeholders are hidden from render by default, explicitly inspectable.
    for name,x,y,h in (("Remy",-.30,2.3,2.5),("Emmi",1.45,2.6,2.0),("Wilma",3.05,2.8,1.9)):
        ph=sphere("PLACEHOLDER_"+name,(x,y,h/2),(.43,.35,h/2),PLACEHOLDER)
        ph.hide_render=True
        ph.display_type="WIRE"
        ph["status"]="Spatial placeholder only; not a modeled crew member"
    return hinge,knob


def aim(obj, target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat("-Z","Y").to_euler()


def camera(name, loc, target, lens=55, ortho=None):
    data=bpy.data.cameras.new("GC_"+name)
    obj=bpy.data.objects.new("GC_"+name,data)
    GC.objects.link(obj)
    obj.location=loc
    aim(obj,target)
    data.lens=lens
    if ortho:
        data.type="ORTHO"
        data.ortho_scale=ortho
    data.clip_end=100
    return obj


def light(name, loc, target, power, size, color):
    data=bpy.data.lights.new("GC_"+name,"AREA")
    data.energy=power
    data.shape="DISK"
    data.size=size
    data.color=color
    obj=bpy.data.objects.new("GC_"+name,data)
    GC.objects.link(obj)
    obj.location=loc
    aim(obj,target)
    return obj


def configure(args):
    scene=bpy.context.scene
    scene.render.engine=args.engine
    if args.engine=="CYCLES":
        scene.cycles.samples=args.samples
        scene.cycles.use_denoising=True
        scene.cycles.device="CPU"
        scene.cycles.max_bounces=6
        scene.cycles.transparent_max_bounces=4
    scene.render.image_settings.file_format="PNG"
    scene.render.image_settings.color_mode="RGB"
    scene.render.resolution_percentage=100
    scene.render.fps=24
    scene.frame_start=1
    scene.frame_end=24
    scene.view_settings.view_transform="AgX"
    scene.view_settings.look="AgX - Medium High Contrast"
    scene.view_settings.exposure=-.10
    world=bpy.data.worlds.new("GC_WarmStudioWorld")
    world.use_nodes=True
    world.node_tree.nodes["Background"].inputs[0].default_value=(.51,.59,.75,1)
    world.node_tree.nodes["Background"].inputs[1].default_value=.30
    scene.world=world
    # Hero key kept neutral enough that Coco remains navy rather than brown.
    light("LargeWindow",(-3.5,-4,6),(-2,0,1.6),500,4.0,(1.0,.86,.69))
    light("FrontSoftbox",(1,-5,4),(-2,-.5,1.5),350,4.0,(.79,.88,1.0))
    light("WarmDoorway",(-3.1,3.0,4.0),(-2.5,-.5,1.4),620,2.2,(1.0,.76,.48))
    light("RoomFill",(3,1,5),(1,3,2),800,5.0,(1.0,.92,.77))
    return scene


def render_view(scene, camera_name, filename, dimensions, frame=1):
    scene.camera=bpy.data.objects[camera_name]
    scene.frame_set(frame)
    scene.render.resolution_x,scene.render.resolution_y=dimensions
    scene.render.filepath=str(OUT/"renders"/filename)
    bpy.ops.render.render(write_still=True)
    return {"file":str(Path(scene.render.filepath)),"camera":camera_name,"frame":frame,"dimensions":list(dimensions)}


def build(args):
    global GC,OUT,BODY_MAT,HEAD_MAT,NAVY_FUR,CREAM_FUR,ORANGE,BROWN,PUPIL,SHINE,BLUSH,MOUTH,TONGUE,FLOOR_JOIN,PLACEHOLDER,EYE_IVORY
    OUT=args.output.resolve()
    (OUT/"renders").mkdir(parents=True,exist_ok=True)
    # Dedicated scene: retain all unrelated data while excluding factory objects
    # and any user's other collections from this pilot's rendered output.
    scene=bpy.data.scenes.get("GC_CocoPilotScene") or bpy.data.scenes.new("GC_CocoPilotScene")
    bpy.context.window.scene=scene
    GC=clear_owned()
    RNG.seed(SEED)
    NAVY_FUR=material("NavyDown",(.006,.014,.046),.80)
    NAVY_FUR.node_tree.nodes.get("Principled BSDF").inputs["Sheen Weight"].default_value=0
    NAVY_FUR.node_tree.nodes.get("Principled BSDF").inputs["Specular IOR Level"].default_value=.15
    CREAM_FUR=material("IvoryDown",(.91,.80,.60),.82)
    CREAM_FUR.node_tree.nodes.get("Principled BSDF").inputs["Sheen Weight"].default_value=0
    CREAM_FUR.node_tree.nodes.get("Principled BSDF").inputs["Specular IOR Level"].default_value=.15
    BODY_MAT=feather_material("BodyVelvet")
    HEAD_MAT=feather_material("HeadVelvet",head=True)
    ORANGE=material("BeakFeetOrange",(.90,.265,.026),.43)
    ORANGE.node_tree.nodes.get("Principled BSDF").inputs["Subsurface Weight"].default_value=.045
    BROWN=material("EyeDarkBrown",(.075,.032,.015),.27)
    EYE_IVORY=material("EyeIvory",(.96,.90,.76),.55)
    PUPIL=material("EyePupil",(.006,.003,.002),.19)
    SHINE=material("EyeWhiteShine",(1,1,1),.15)
    BLUSH=material("CheekWarmth",(.83,.39,.25),.86)
    MOUTH=material("MouthWarmDark",(.090,.012,.005),.57)
    TONGUE=material("TongueCoral",(.69,.12,.058),.56)
    FLOOR_JOIN=material("FloorJoint",(.30,.19,.095),.80)
    PLACEHOLDER=material("CrewPlaceholder",(.23,.39,.45),.80)
    root=build_coco()
    hinge,knob=build_room()
    scene=configure(args)
    camera("CAM_Desktop",(1.0,-11.5,4.0),(-.15,.4,1.92),55)
    camera("CAM_Inspection",(-2.03,-7.9,2.45),(-2.03,-.52,1.62),58)
    camera("CAM_Mobile",(-.65,-10.0,3.22),(-2.12,-.10,2.13),48)
    camera("CAM_Side",(3.7,-4.2,2.8),(-2.03,-.5,1.7),58)
    scene.frame_set(1)
    scene.camera=bpy.data.objects["GC_CAM_Desktop"]
    scene.render.resolution_x=1200
    scene.render.resolution_y=800
    scene["GC_task_id"]="GC-DESIGN-05"
    scene["GC_pilot_status"]="Inspection pilot; not visually accepted production master"
    scene["GC_reference_notes"]="Canonical front/three-quarter guide inspected. Side/back and door interaction inferred. No baked text."
    bpy.context.view_layer.update()
    # Save before rendering so a long render never exists without editable source.
    blend=OUT/"coco-door-pilot.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    views=[]
    if args.render in ("desktop","all"):
        views.append(render_view(scene,"GC_CAM_Desktop","desktop-frame-01.png",(1200,800)))
    if args.render in ("inspection","all"):
        views.append(render_view(scene,"GC_CAM_Inspection","inspection-frame-01.png",(900,1000)))
    if args.render in ("mobile","all"):
        views.append(render_view(scene,"GC_CAM_Mobile","mobile-frame-01.png",(720,1080)))
    if args.render in ("poses","all"):
        for frame in (1,12,24):
            views.append(render_view(scene,"GC_CAM_Inspection","pose-frame-%02d.png"%frame,(540,640),frame))
        views.append(render_view(scene,"GC_CAM_Side","side-frame-01.png",(800,900)))
    scene.frame_set(1)
    scene.camera=bpy.data.objects["GC_CAM_Desktop"]
    scene.render.resolution_x=1200
    scene.render.resolution_y=800
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    evidence={"task":"GC-DESIGN-05","blender":bpy.app.version_string,"engine":args.engine,"device":"CPU","samples":args.samples,"seed":SEED,"blend":str(blend),"views":views,"scene_objects":len(GC.all_objects),"text_objects":[o.name for o in GC.all_objects if o.type=="FONT"],"paid_provider_calls":0,"reference_bitmap_materials":0,"status":"Built and rendered; separate reopen verification required"}
    (OUT/"build-evidence.json").write_text(json.dumps(evidence,indent=2)+"\n")
    print("GC_PILOT_BUILD "+json.dumps(evidence))


if __name__=="__main__":
    build(arguments())
