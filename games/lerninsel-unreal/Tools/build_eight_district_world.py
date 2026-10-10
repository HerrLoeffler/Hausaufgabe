"""Build a local Blender world shell for the eight Lerninsel districts.

This reads the saved LocalAssetsV2 Blender library, creates a separate scene,
and writes a .blend, one static FBX world shell, one overview and eight eye-level
district renders. It never writes to the source asset library and makes no
network or paid-generator calls.
"""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector


PROJECT = Path(__file__).resolve().parents[1]
ART = PROJECT / "Content/Art"
SOURCE = ART / "LocalAssetsV2/Lerninsel_LocalAssets_v2.blend"
OUT = ART / "LerninselWorldV1"
EXPORT = OUT / "Export"
RENDERS = OUT / "Previews"
SEED = 310805
random.seed(SEED)
OUT.mkdir(parents=True, exist_ok=True)
EXPORT.mkdir(parents=True, exist_ok=True)
RENDERS.mkdir(parents=True, exist_ok=True)

# Load the source before creating output IDs; opening a .blend replaces Blender IDs.
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))


DISTRICTS = [
    {"id": 1, "name": "Verbengarten", "center": (-4.5, 7.0), "color": "Herbstgold", "focus": "amber trees, chalk arch, verbs"},
    {"id": 2, "name": "Satzdorf", "center": (21.5, -7.0), "color": "Lindenrosa", "focus": "warm stone houses, terracotta roofs, sentence plaza"},
    {"id": 3, "name": "Bruchterrassen", "center": (55.0, 7.5), "color": "Wasserblau", "focus": "stepped pools, limestone, measured water"},
    {"id": 4, "name": "Beobachtungsküste", "center": (94.0, -7.0), "color": "Ockermeer", "focus": "layered shore rocks, driftwood, viewpoint ring"},
    {"id": 5, "name": "Heckenlabyrinth", "center": (39.0, 15.0), "color": "Smaragd", "focus": "low readable hedge paths and stone threshold"},
    {"id": 6, "name": "Spiegelgarten", "center": (75.0, -15.0), "color": "Mintspiegel", "focus": "paired pavilions, still water, mirrored planting"},
    {"id": 7, "name": "Klangwald", "center": (107.0, 15.0), "color": "Bambusgruen", "focus": "bamboo grove, visible chimes, quiet glade"},
    {"id": 8, "name": "Leuchtturm", "center": (122.0, 2.5), "color": "Leuchtsignal", "focus": "eight-window lighthouse, island vista"},
]


def mat(name: str, color, rough=0.78, metallic=0.0, emission=None):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission
    return m


MAT = {
    "grass": mat("World_IslandGrass", (.19, .34, .095)),
    "grass_lime": mat("World_LimeGrass", (.28, .40, .105)),
    "sand": mat("World_ShoreSand", (.57, .40, .21)),
    "stone": mat("World_WarmLimestone", (.66, .56, .40)),
    "stone_light": mat("World_ChalkStone", (.78, .69, .52)),
    "stone_dark": mat("World_WeatheredStone", (.39, .34, .26)),
    "wood": mat("World_Wood", (.24, .105, .045)),
    "roof": mat("World_Terracotta", (.48, .13, .055)),
    "water": mat("World_ClearWater", (.035, .31, .40), .24),
    "water_lite": mat("World_WaterGlint", (.17, .53, .57), .20),
    "metal": mat("World_DarkMetal", (.09, .12, .105), .43, .42),
    "mint": mat("World_MintSignal", (.045, .45, .34), .32, .05, .22),
    "glass": mat("World_LighthouseGlass", (.16, .45, .41), .18, .1, .45),
    "pink": mat("World_BlossomPink", (.72, .24, .39), .68),
    "leafgreen": mat("World_DeepLeafGreen", (.12, .30, .075), .72),
    "ivory": mat("World_Ivory", (.90, .81, .62), .62),
    "ink": mat("World_DeepInk", (.035, .052, .044), .8),
}

# place_asset reads the district palette while copying material slots.
current_zone = [1]


def mesh_obj(name, verts, faces, collection, materials, mat_ids=None, smooth=False):
    me = bpy.data.meshes.new(name + "_Mesh")
    me.from_pydata(verts, [], faces)
    me.materials.clear()
    for m in materials:
        me.materials.append(m)
    me.update()
    if mat_ids:
        for p, idx in zip(me.polygons, mat_ids):
            p.material_index = idx
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    return ob


def box(name, center, size, material, collection, bevel=0.025):
    cx, cy, cz = center
    sx, sy, sz = (v * .5 for v in size)
    verts = [(cx + x, cy + y, cz + z) for x, y, z in [
        (-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz),
        (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz),
    ]]
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    ob = mesh_obj(name, verts, faces, collection, [material])
    if bevel > 0:
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=3, affect="EDGES", profile=.5)
        bm.to_mesh(ob.data)
        bm.free()
        ob.data.update()
    return ob


def cylinder(name, center, radius, depth, material, collection, sides=24, radius_top=None):
    x, y, z = center
    rt = radius if radius_top is None else radius_top
    verts = []
    for zz, rr in ((z - depth / 2, radius), (z + depth / 2, rt)):
        verts.extend((x + rr * math.cos(i * math.tau / sides), y + rr * math.sin(i * math.tau / sides), zz) for i in range(sides))
    faces = [tuple(range(sides - 1, -1, -1)), tuple(range(sides, sides * 2))]
    faces.extend((i, (i + 1) % sides, (i + 1) % sides + sides, i + sides) for i in range(sides))
    return mesh_obj(name, verts, faces, collection, [material], smooth=True)


def cone(name, center, radius, depth, material, collection, sides=24):
    return cylinder(name, center, radius, depth, material, collection, sides, radius_top=.015)


def ribbon(name, points, width, material, collection, z=.015):
    points = [Vector((p[0], p[1], z)) for p in points]
    verts = []
    for i, p in enumerate(points):
        tangent = (points[min(i + 1, len(points) - 1)] - points[max(i - 1, 0)]).normalized()
        side = Vector((-tangent.y, tangent.x, 0)).normalized()
        local_width = width * (0.88 + .12 * math.sin(i * .77))
        verts.extend((p - side * local_width / 2, p + side * local_width / 2))
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(len(points) - 1)]
    return mesh_obj(name, verts, faces, collection, [material], smooth=True)


def terrain_shell(collection):
    # Long but irregular island silhouette sized around the existing 150 m route.
    cx, rx, ry = 54.0, 76.0, 22.8
    segments, rings = 192, 44
    verts = [(cx, 0, -.08)]
    for ring in range(1, rings + 1):
        r = ring / rings
        for i in range(segments):
            a = i * math.tau / segments
            ripple = 1 + .018 * math.sin(a * 5 + .6) + .012 * math.cos(a * 9 - .4) + .007 * math.sin(a * 17 + .2)
            xx = cx + rx * r * ripple * math.cos(a)
            yy = ry * r * ripple * math.sin(a)
            edge = max(0.0, (r - .64) / .36)
            zz = -.08 - .44 * edge ** 1.7 + .06 * math.sin(a * 7 + r * 16) * edge
            verts.append((xx, yy, zz))
    faces, mids = [], []
    for i in range(segments):
        faces.append((0, 1 + i, 1 + (i + 1) % segments))
        mids.append(0)
    for ring in range(1, rings):
        a0 = 1 + (ring - 1) * segments
        a1 = 1 + ring * segments
        for i in range(segments):
            faces.append((a0 + i, a1 + i, a1 + (i + 1) % segments, a0 + (i + 1) % segments))
            mids.append(1 if ring > rings * .82 else 0)
    top = mesh_obj("World_IslandSurface", verts, faces, collection, [MAT["grass"], MAT["sand"]], mids, smooth=True)

    outer_start = 1 + (rings - 1) * segments
    cliff_verts = [verts[outer_start + i] for i in range(segments)]
    cliff_verts += [(cx + (rx + 1.0) * math.cos(i * math.tau / segments), (ry + .4) * math.sin(i * math.tau / segments), -4.5) for i in range(segments)]
    cliff_faces = []
    for i in range(segments):
        cliff_faces.append((i, (i + 1) % segments, segments + (i + 1) % segments, segments + i))
    cliff = mesh_obj("World_LayeredCoast", cliff_verts, cliff_faces, collection, [MAT["sand"], MAT["stone_dark"]], [i % 4 == 0 for i in range(segments)])
    water = box("World_Sea", (54, 0, -4.55), (250, 115, .1), MAT["water"], collection, 0)
    water["role"] = "visual sea only; gameplay collision stays in Unreal"
    return top, cliff, water


def palette_variant(source, zone_id, purpose):
    key = f"World_Z{zone_id}_{purpose}_{source.name}"
    if key in bpy.data.materials:
        return bpy.data.materials[key]
    v = source.copy()
    v.name = key
    base = source.name.lower()
    colors = {
        "grass": (.20, .39, .105), "stone": (.69, .59, .43), "wood": (.27, .11, .045),
        "sand": (.58, .42, .23), "water": (.035, .36, .45), "ivory": (.91, .82, .64),
        "interactive": (.045, .42, .34), "leaforange": (.68, .19, .025),
        "leafgold": (.78, .43, .045), "leafgreen": (.13, .35, .065), "metal": (.10, .13, .115),
    }
    if "grass" in base:
        color = colors["grass"]
    elif "stone" in base:
        color = colors["stone"]
    elif "wood" in base:
        color = colors["wood"]
    elif "sand" in base:
        color = colors["sand"]
    elif "water" in base:
        color = colors["water"]
    elif "ivory" in base:
        color = colors["ivory"]
    elif "interactive" in base:
        color = colors["interactive"]
    elif "leaforange" in base:
        color = colors["leaforange"]
    elif "leafgold" in base:
        color = colors["leafgold"]
    elif "leafgreen" in base:
        color = colors["leafgreen"]
    elif "metal" in base:
        color = colors["metal"]
    else:
        color = tuple(source.diffuse_color[:3])

    # The same tree family changes season by district, while geometry stays shared.
    if purpose == "autumn" and any(t in base for t in ("leafgreen", "leafgold", "leaforange")):
        color = ((.74, .24, .026) if zone_id == 1 else (.82, .47, .06))
    elif purpose == "pink_blossom" and "ivory" in base:
        color = (.78, .31, .42)
    elif purpose == "lime_canopy" and "leafgreen" in base:
        color = (.31, .47, .085)
    elif purpose == "deep_green" and "leafgreen" in base:
        color = (.075, .24, .075)
    v.diffuse_color = (*color, 1)
    if v.use_nodes:
        bsdf = next(n for n in v.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        bsdf.inputs["Base Color"].default_value = (*color, 1)
    return v


def combine(objects, name):
    objects = [o for o in objects if o and bpy.data.objects.get(o.name) == o]
    if not objects:
        return None
    # Keep the source props modular. Joining thousands of separately authored
    # pieces in one operator call is brittle; Unreal's FBX importer combines meshes.
    if len(objects) == 1:
        objects[0].name = name
    return objects[0]


def place_asset(source_collection_name, target, yaw=0.0, scale=1.0, palette="natural", label=None):
    src = bpy.data.collections.get(source_collection_name)
    if src is None:
        raise RuntimeError(f"Missing source collection: {source_collection_name}")
    root = next((o for o in src.objects if o.parent is None and o.type == "EMPTY"), None)
    if root is None:
        root = next((o for o in src.objects if o.parent is None), None)
    if root is None:
        raise RuntimeError(f"No root in source collection: {source_collection_name}")
    bpy.context.view_layer.update()
    root_inverse = root.matrix_world.inverted()
    place = Matrix.Translation(Vector(target)) @ Matrix.Rotation(yaw, 4, "Z") @ Matrix.Diagonal((scale, scale, scale, 1))
    created = []
    for source in src.objects:
        if source.type != "MESH" or source.name.startswith("UCX_") or source.get("collision_proxy"):
            continue
        relative = root_inverse @ source.matrix_world
        data = source.data.copy()
        data.transform(place @ relative)
        for idx, source_mat in enumerate(list(data.materials)):
            if source_mat:
                data.materials[idx] = palette_variant(source_mat, current_zone[0], palette)
        data.update()
        obj = bpy.data.objects.new((label or source.name) + "_part", data)
        world_collection.objects.link(obj)
        created.append(obj)
    return combine(created, label or source_collection_name.replace("LI_SM_", ""))


def add_house(x, y, yaw, collection, tag):
    built = []
    # Compact, believable proportions: walls, raised plinth, gable roof, timber and glass.
    built.append(box(tag + "_plinth", (x, y, .20), (4.9, 3.5, .42), MAT["stone_dark"], collection, .10))
    built.append(box(tag + "_walls", (x, y, 1.95), (4.6, 3.2, 3.1), MAT["stone_light"], collection, .10))
    # Pitched roof sides meet on a ridge. The gable has a separate triangular end.
    for side in (-1, 1):
        roof = box(tag + "_roof", (x, y + side * .78, 3.75), (5.2, 1.95, .24), MAT["roof"], collection, .06)
        roof.rotation_euler[0] = side * math.radians(34)
        built.append(roof)
    built.append(box(tag + "_ridge", (x, y, 4.32), (5.35, .20, .22), MAT["roof"], collection, .04))
    # Door, lintel, two recessed window surrounds and pale shutters.
    built.append(box(tag + "_door", (x, y - 1.615, 1.20), (.86, .10, 2.10), MAT["wood"], collection, .05))
    built.append(box(tag + "_door_lintel", (x, y - 1.70, 2.33), (1.12, .14, .16), MAT["stone_dark"], collection, .035))
    for side in (-1, 1):
        built.append(box(tag + f"_window_{side}", (x + side * 1.42, y - 1.62, 2.12), (.73, .10, .81), MAT["glass"], collection, .025))
        for xx in (-.42, .42):
            built.append(box(tag + f"_frame_{side}_{xx}", (x + side * 1.42 + xx, y - 1.71, 2.12), (.08, .08, .98), MAT["wood"], collection, .02))
        built.append(box(tag + f"_sill_{side}", (x + side * 1.42, y - 1.74, 1.66), (.98, .15, .10), MAT["stone_dark"], collection, .02))
    return built


def add_bamboo(x, y, collection, tag):
    built = []
    for i in range(13):
        a = random.random() * math.tau
        r = random.uniform(.2, 2.3)
        px, py = x + math.cos(a) * r, y + math.sin(a) * r
        h = random.uniform(4.4, 6.2)
        radius = random.uniform(.075, .12)
        built.append(cylinder(f"{tag}_stalk_{i}", (px, py, h / 2), radius, h, MAT["grass_lime"], collection, 12))
        for z in (h * .28, h * .56, h * .82):
            built.append(cylinder(f"{tag}_joint_{i}_{z}", (px, py, z), radius * 1.08, .07, MAT["grass"], collection, 12))
        for j in range(3):
            side = -1 if j % 2 else 1
            leaf = ribbon(f"{tag}_leaf_{i}_{j}", [(px, py, h * .68), (px + side * .36, py + .06, h * .82), (px + side * .83, py + .12, h * .88)], .20, MAT["leafgreen"], collection, h * .87)
            built.append(leaf)
    return built


def add_hedge_maze(x, y, collection, zone_id=5):
    built = []
    # Broad lanes (2.0–2.3 m), short sight-lines and two unmistakable openings.
    hedges = [
        (-5.5, 0, 11, .8), (5.5, 0, 11, .8), (0, -5.5, 5.0, .8), (0, 5.5, 5.0, .8),
        (-3.1, -2.8, .8, 4.8), (3.1, 2.8, .8, 4.8), (-3.0, 3.1, 3.7, .8), (3.0, -3.1, 3.7, .8),
        (0, -1.0, 2.4, .75), (0, 1.6, 2.6, .75),
    ]
    for i, (dx, dy, sx, sy) in enumerate(hedges):
        ob = box(f"HedgeMaze_{i}", (x + dx, y + dy, .86), (sx, sy, 1.65), MAT["grass"], collection, .30)
        # Add a second, softer green crown, leaving the level-top silhouette natural.
        cap = box(f"HedgeCap_{i}", (x + dx, y + dy, 1.68), (sx * .94, sy * .92, .18), MAT["grass_lime"], collection, .09)
        built.extend((ob, cap))
    # Pale entry stones reveal the maze entrance before the first turn.
    for i in range(5):
        built.append(box(f"HedgeEntryStone_{i}", (x - 1.5 + i * .75, y - 7.25, .03), (.62, .52, .08), MAT["stone_light"], collection, .10))
    return built


def add_mirror_garden(x, y, collection):
    built = []
    for side in (-1, 1):
        px = x + side * 4.3
        water = cylinder(f"MirrorPool_{side}", (px, y, .015), 2.55, .035, MAT["water"], collection, 64)
        ring = cylinder(f"MirrorPoolLip_{side}", (px, y, -.01), 2.82, .28, MAT["stone_light"], collection, 64)
        built.extend((water, ring))
        for p in range(6):
            a = p * math.tau / 6
            col = cylinder(f"MirrorPavilionCol_{side}_{p}", (px + math.cos(a) * 2.0, y + math.sin(a) * 2.0, 1.4), .17, 2.8, MAT["stone"], collection, 16, .13)
            built.append(col)
        arch = box(f"MirrorPavilionLintel_{side}", (px, y, 2.95), (4.8, .32, .30), MAT["stone_light"], collection, .12)
        built.append(arch)
    # One restrained central reflecting marker, visible from the approach.
    built.append(cone("MirrorMarker", (x, y, .74), .38, 1.45, MAT["mint"], collection, 24))
    return built


def add_lighthouse(collection, center=(122.0, 2.5)):
    x, y = center
    built = []
    built.append(cylinder("LighthouseFoundation", (x, y, .40), 2.65, .80, MAT["stone_dark"], collection, 48))
    built.append(cylinder("LighthouseBody", (x, y, 4.10), 1.95, 6.60, MAT["stone_light"], collection, 40, 1.55))
    for z in (1.05, 1.45, 6.80):
        built.append(cylinder(f"LighthouseBand_{z}", (x, y, z), 2.02 if z < 2 else 1.62, .18, MAT["stone"], collection, 40))
    # Eight openings align with the existing eight Unreal signal meshes on the western face.
    for row, z in enumerate((3.98, 5.28)):
        for col in range(4):
            py = y + (col - 1.5) * .61
            built.append(box(f"LighthouseWindow_{row}_{col}", (120.25, py, z), (.10, .35, .52), MAT["glass"], collection, .035))
            built.append(box(f"LighthouseSill_{row}_{col}", (120.18, py, z - .31), (.18, .49, .10), MAT["stone_dark"], collection, .025))
    built.append(cylinder("LighthouseLanternRoom", (x, y, 7.88), 1.50, 1.35, MAT["glass"], collection, 40))
    for i in range(8):
        a = i * math.tau / 8
        px, py = x + 1.52 * math.cos(a), y + 1.52 * math.sin(a)
        built.append(cylinder(f"LighthouseLanternFrame_{i}", (px, py, 7.88), .055, 1.46, MAT["metal"], collection, 12))
    built.append(cylinder("LighthouseLanternRoof", (x, y, 8.73), 1.85, .22, MAT["roof"], collection, 40))
    built.append(cone("LighthouseCrown", (x, y, 9.30), 1.70, 1.05, MAT["roof"], collection, 40))
    built.append(cone("LighthouseFinial", (x, y, 10.02), .18, .55, MAT["metal"], collection, 20))
    built.append(box("LighthouseDoor", (120.12, y, 1.43), (.13, .92, 1.9), MAT["wood"], collection, .045))
    return built


def set_camera(camera, position, target, lens=32):
    camera.location = Vector(position)
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = lens
    camera.data.clip_end = 600


def add_camera(collection, name, position, target, lens=32):
    data = bpy.data.cameras.new(name)
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    set_camera(obj, position, target, lens)
    return obj


def render_in_scene(scene):
    with bpy.context.temp_override(window=bpy.context.window, scene=scene, view_layer=scene.view_layers[0]):
        bpy.ops.render.render(write_still=True)


def exportable_meshes(collection):
    return [o for o in collection.objects if o.type == "MESH" and not o.name.startswith("UCX_")]


# Separate output scene: the source scene and its original objects remain intact.
source_scene = bpy.context.scene
world_scene = bpy.data.scenes.new("Lerninsel | Acht Gebiete")
if bpy.context.window:
    bpy.context.window.scene = world_scene
world_collection = bpy.data.collections.new("Lerninsel | Spielwelt V1")
world_scene.collection.children.link(world_collection)

terrain_shell(world_collection)

# Main walkable trail, shaded paths and side-glade connectors.
main_points = [(-20, 0), (-14, -.2), (-8, .0), (-2, .15), (7, -.1), (17, .12), (29, 0), (42, .14), (55, 0), (70, -.12), (83, .12), (96, 0), (110, .14), (124, 0), (130, .1)]
ribbon("World_MainWalk", main_points, 2.45, MAT["sand"], world_collection, .012)
for district in DISTRICTS[:7]:
    x, y = district["center"]
    if abs(y) > 2:
        ribbon(f"World_SideWalk_{district['id']}", [(x - 3.8, 0), (x - 2.2, y * .38), (x, y * .72), (x + 2.5, y)], 1.42, MAT["stone"], world_collection, .02)

# Six sandstone arches follow the existing progression gates; the interactive doors remain in Unreal.
for i, x in enumerate((-1.5, 13.5, 31.0, 50.5, 65.0, 115.5), 1):
    current_zone[0] = min(i, 8)
    place_asset("LI_SM_Gate_Arch", (x, 0, .0), yaw=math.pi / 2, scale=1.08, palette="natural", label=f"World_ProgressArch_{i}")

# Natural edge placement keeps the central learning path open and bright.
for i in range(44):
    a = i * math.tau / 44 + random.uniform(-.05, .05)
    x = 54 + 71.0 * math.cos(a)
    y = 21.4 * math.sin(a)
    asset = f"LI_SM_Env_Rock_{1 + i % 3:02d}"
    place_asset(asset, (x, y, -.03), yaw=random.uniform(0, math.tau), scale=random.uniform(1.5, 2.3), palette="natural", label=f"CoastRock_{i:02d}")
    if i % 2 == 0:
        place_asset("LI_SM_Env_ShoreSand", (x * .98 + .7, y * .98, -.03), yaw=a, scale=random.uniform(1.25, 1.75), palette="natural", label=f"ShoreSand_{i:02d}")


def trees_for(zone_id, center, types, offsets, palette):
    for i, (dx, dy, scale, yaw) in enumerate(offsets):
        source = types[i % len(types)]
        place_asset(f"LI_SM_Env_Tree_{source:02d}", (center[0] + dx, center[1] + dy, -.02), yaw=yaw, scale=scale, palette=palette, label=f"Z{zone_id}_Tree_{i:02d}")


def ground_cover(zone_id, center, *, bushes=3, flowers=5, grass=9, rocks=3, palette="natural"):
    for i in range(bushes):
        a = i * math.tau / max(1, bushes) + .23
        radius = random.uniform(4.5, 8.0)
        typ = i % 3 + 1
        place_asset(f"LI_SM_Env_Bush_{typ:02d}", (center[0] + math.cos(a) * radius, center[1] + math.sin(a) * radius, -.02), yaw=a, scale=random.uniform(1.0, 1.35), palette=palette, label=f"Z{zone_id}_Bush_{i:02d}")
    for i in range(flowers):
        a = i * 2.399
        radius = random.uniform(3.5, 9.5)
        place_asset("LI_SM_Env_FlowerPatch", (center[0] + math.cos(a) * radius, center[1] + math.sin(a) * radius, .015), yaw=a, scale=random.uniform(.8, 1.2), palette="natural", label=f"Z{zone_id}_Flowers_{i:02d}")
    for i in range(grass):
        x = center[0] + random.uniform(-9.5, 9.5)
        y = center[1] + random.choice((-1, 1)) * random.uniform(3.8, 9.2)
        place_asset("LI_SM_Env_GrassTuft", (x, y, .005), yaw=random.random() * math.tau, scale=random.uniform(.9, 1.5), palette=palette, label=f"Z{zone_id}_Grass_{i:02d}")
    for i in range(rocks):
        a = i * 1.91
        r = random.uniform(5.8, 10)
        place_asset(f"LI_SM_Env_Rock_{i % 3 + 1:02d}", (center[0] + math.cos(a) * r, center[1] + math.sin(a) * r, .01), yaw=a, scale=random.uniform(.75, 1.2), palette="natural", label=f"Z{zone_id}_Rock_{i:02d}")


for d in DISTRICTS:
    zid, center = d["id"], d["center"]
    current_zone[0] = zid
    if zid == 1:
        trees_for(zid, center, (1, 2, 1), [(-10, 1, 1.25, .4), (-5, 8, 1.05, 1.0), (4, 8, 1.18, 2.1), (10, 1, 1.30, 2.8), (7, -7, .92, 3.0), (-8, -7, 1.0, 4.0)], "autumn")
        ground_cover(zid, center, bushes=3, flowers=5, grass=12, rocks=2, palette="autumn")
        place_asset("LI_SM_Env_Lantern", (center[0] + 1.0, center[1] + 2.4, .02), yaw=0, scale=2.5, label="Verbengarten_Lantern")
    elif zid == 2:
        trees_for(zid, center, (3, 1, 2), [(-10, 8, .95, .2), (10, 8, 1.02, 1.5), (-11, -7, .82, 2.8), (11, -7, .95, 3.8)], "pink_blossom")
        for i, (dx, dy, angle) in enumerate(((-4.5, 5.8, 0), (4.5, 5.8, 0), (-4.5, -5.0, math.pi), (4.5, -5.0, math.pi))):
            add_house(center[0] + dx, center[1] + dy, angle, world_collection, f"SentenceVillageHouse_{i}")
        ground_cover(zid, center, bushes=4, flowers=9, grass=7, rocks=1, palette="lime_canopy")
    elif zid == 3:
        trees_for(zid, center, (2, 3, 3), [(-11, 8, .9, 0), (10, 9, 1.0, .8), (-12, -8, .86, 2.4), (11, -8, .9, 3.6)], "lime_canopy")
        for i, dx in enumerate((-6.5, 0.0, 6.5)):
            z = -.01 + i * .12
            basin = box(f"FractionTerracePool_{i}", (center[0] + dx, center[1], z), (5.2, 3.2, .28), MAT["stone_light"], world_collection, .16)
            water = box(f"FractionTerraceWater_{i}", (center[0] + dx, center[1], z + .17), (4.8, 2.82, .045), MAT["water"], world_collection, .09)
            lip = box(f"FractionTerraceLip_{i}", (center[0] + dx, center[1] + 1.73, z + .28), (4.95, .13, .12), MAT["stone"], world_collection, .045)
        ground_cover(zid, center, bushes=2, flowers=5, grass=8, rocks=5, palette="natural")
    elif zid == 4:
        trees_for(zid, center, (1, 2, 3), [(-10, 7, .78, .3), (10, 7, .86, 1.8), (11, -7, .75, 3.2)], "deep_green")
        ground_cover(zid, center, bushes=2, flowers=4, grass=6, rocks=7, palette="deep_green")
        for i, xoff in enumerate((-8.0, -4.0, 3.5, 8.0)):
            place_asset("LI_SM_Env_Shell", (center[0] + xoff, center[1] - 9.8 + (i % 2) * 1.0, .02), yaw=i * .67, scale=random.uniform(1.6, 2.1), palette="natural", label=f"CoastShell_{i}")
        place_asset("LI_SM_Env_Driftwood", (center[0] + 1.0, center[1] + 9.0, .02), yaw=.25, scale=2.7, label="CoastDriftwood")
    elif zid == 5:
        add_hedge_maze(center[0], center[1], world_collection)
        trees_for(zid, center, (3, 2), [(-10, 8, .86, 0), (10, 8, .92, 2.0), (-10, -8, .82, 3.5)], "deep_green")
        ground_cover(zid, center, bushes=3, flowers=4, grass=5, rocks=2, palette="deep_green")
    elif zid == 6:
        trees_for(zid, center, (3, 1, 2), [(-10, 9, .84, .5), (10, 9, .86, 1.8), (-11, -8, .78, 3.1), (11, -8, .82, 4.2)], "lime_canopy")
        add_mirror_garden(center[0], center[1], world_collection)
        ground_cover(zid, center, bushes=3, flowers=7, grass=7, rocks=2, palette="lime_canopy")
    elif zid == 7:
        trees_for(zid, center, (3, 2), [(-10, 8, .72, .1), (10, 8, .78, 1.8), (-10, -8, .76, 3.2)], "deep_green")
        add_bamboo(center[0], center[1], world_collection, "SoundGroveBamboo")
        ground_cover(zid, center, bushes=3, flowers=2, grass=12, rocks=1, palette="deep_green")
        for i, dx in enumerate((-2.0, 1.0, 4.0)):
            built = cylinder(f"SoundGroveChime_{i}", (center[0] + dx, center[1] - 3.8, 3.0), .08, random.uniform(.65, 1.0), MAT["metal"], world_collection, 12)
            built.rotation_euler[1] = .07 * (i + 1)
            box(f"SoundGroveChimeCap_{i}", (center[0] + dx, center[1] - 3.8, 3.53), (.32, .32, .12), MAT["wood"], world_collection, .045)
    elif zid == 8:
        add_lighthouse(world_collection, center)
        trees_for(zid, center, (1, 3), [(-8, 9, .85, .2), (8, 8, .72, 2.7), (-8, -8, .78, 3.4)], "deep_green")
        ground_cover(zid, center, bushes=2, flowers=4, grass=6, rocks=3, palette="natural")

# Small limestone viewing plinth at the observation coast; all puzzle parts remain in Unreal.
coast = DISTRICTS[3]["center"]
for i, radius in enumerate((1.45, 1.22)):
    cylinder(f"ObservationViewMarker_{i}", (coast[0], coast[1], .035 + i * .03), radius, .06, MAT["stone_light" if i == 0 else "mint"], world_collection, 64)

# Eight extra gate-side flower/stone groupings create distinct transitions without blocking walkways.
for i, x in enumerate((-8, 8, 24, 43, 59, 82, 103, 118)):
    for side in (-1, 1):
        place_asset("LI_SM_Env_FlowerPatch", (x + .65 * (i % 2), side * 4.5, .015), yaw=i * .4 + side * .2, scale=.92, label=f"TransitionFlower_{i}_{side}")

# Material-accurate local views: the camera is eye height and uses natural perspective.
sun_data = bpy.data.lights.new("World_Sun", "SUN")
sun = bpy.data.objects.new("World_Sun", sun_data)
world_collection.objects.link(sun)
sun.location = (30, -45, 90)
sun.rotation_euler = (math.radians(25), math.radians(-28), math.radians(-25))
sun_data.energy = 2.3
sun_data.angle = math.radians(8)
fill_data = bpy.data.lights.new("World_Fill", "AREA")
fill = bpy.data.objects.new("World_Fill", fill_data)
world_collection.objects.link(fill)
fill.location = (65, -8, 45)
fill_data.energy = 3500
fill_data.shape = "DISK"
fill_data.size = 35
camera_collection = bpy.data.collections.new("Review cameras")
world_scene.collection.children.link(camera_collection)
overview = add_camera(camera_collection, "Camera_WorldOverview", (61, -122, 92), (54, 0, -.5), 31)
world_scene.camera = overview
world = world_scene.world or bpy.data.worlds.new("World_Sky")
world_scene.world = world
world.use_nodes = True
background = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
background.inputs["Color"].default_value = (.30, .52, .69, 1)
background.inputs["Strength"].default_value = .55
world_scene.render.resolution_x = 1800
world_scene.render.resolution_y = 1100
world_scene.render.resolution_percentage = 100
world_scene.render.image_settings.file_format = "PNG"
world_scene.render.image_settings.color_mode = "RGBA"
world_scene.view_settings.view_transform = "AgX"
world_scene.render.engine = "BLENDER_EEVEE"
try:
    world_scene.eevee.taa_render_samples = 64
except Exception:
    pass
world_scene.render.filepath = str(RENDERS / "Lerninsel_Overview.png")
render_in_scene(world_scene)

overview_files = [str(RENDERS / "Lerninsel_Overview.png")]
for d in DISTRICTS:
    x, y = d["center"]
    cam = add_camera(camera_collection, f"Camera_Z{d['id']:02d}_{d['name']}", (x - 7.5, y - 12.5, 1.68), (x, y, 2.2), 30)
    world_scene.camera = cam
    world_scene.render.resolution_x = 1200
    world_scene.render.resolution_y = 720
    world_scene.render.resolution_percentage = 100
    dest = RENDERS / f"Z{d['id']:02d}_{d['name']}.png"
    world_scene.render.filepath = str(dest)
    render_in_scene(world_scene)
    overview_files.append(str(dest))

# Export all static visual set dressing as one collision-free Unreal mesh.
for o in list(camera_collection.objects):
    o.hide_render = True
static_meshes = exportable_meshes(world_collection)
if not static_meshes:
    raise RuntimeError("No static world geometry to export")
with bpy.context.temp_override(window=bpy.context.window, scene=world_scene, view_layer=world_scene.view_layers[0]):
    bpy.ops.export_scene.fbx(
        filepath=str(EXPORT / "SM_Lerninsel_Achtgebiete.fbx"),
        use_selection=False,
        object_types={"MESH"},
        use_mesh_modifiers=True,
        mesh_smooth_type="FACE",
        add_leaf_bones=False,
        apply_unit_scale=True,
        apply_scale_options="FBX_SCALE_UNITS",
        bake_anim=False,
    )

asset_info = {
    "task": "GC-GAMES-ESCAPE-VISUAL-01",
    "source_blend": str(SOURCE),
    "output_blend": str(OUT / "Lerninsel_Achtgebiete.blend"),
    "world_fbx": str(EXPORT / "SM_Lerninsel_Achtgebiete.fbx"),
    "mesh_objects": len(static_meshes),
    "triangles": sum(len(o.data.loop_triangles) for o in static_meshes),
    "districts": DISTRICTS,
    "renders": overview_files,
    "source_preserved": True,
    "generator_calls": 0,
    "collision": "none; existing Unreal gameplay floor and puzzle collision remain authoritative",
}
with open(OUT / "world_manifest.json", "w", encoding="utf-8") as f:
    json.dump(asset_info, f, ensure_ascii=False, indent=2)

world_scene.camera = overview
world_scene.render.resolution_x = 1800
world_scene.render.resolution_y = 1100
world_scene.render.resolution_percentage = 100
world_scene.render.filepath = str(RENDERS / "Lerninsel_Overview.png")
bpy.context.preferences.filepaths.save_version = 0
bpy.context.window.scene = world_scene
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "Lerninsel_Achtgebiete.blend"))
print("LERNINSEL_WORLD_READY", json.dumps(asset_info, ensure_ascii=False))
