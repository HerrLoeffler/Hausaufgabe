# Remy-Farbedits – integriertes Imagegen

Drei gezielte Änderungen der vorhandenen Rasterbilder. Originale bleiben erhalten. Kein CLI-/API-Fallback.

## hero

Use case: precise-object-edit. Edit target: the attached GradeCrew classroom image. Change ONLY Remy, the elephant in the center-left holding a tablet, from gray/lilac to a subtle pale powder light blue (body reference #B7D6ED, lit areas #DAEBF7, natural blue shadows #7EA8C7). It should be soft and lightly blue, not saturated cyan or dark blue. Preserve Remy's face, exact pose, smile, eye color, trunk, fine soft texture, pink inner ears and cream nails; preserve the existing lighting. Do not recolor the dark gray tablet. Keep Coco the penguin, Emmi the fox, Wilma the owl, every object, classroom, camera angle, composition and image dimensions visually identical. Do not regenerate or redesign the scene. No text, no new objects, no extra devices.

## tablet

Use case: precise-object-edit. Input image 1 is the EDIT TARGET: transparent standalone Remy with a dark tablet. Input image 2 is COLOR REFERENCE ONLY: light blue Remy in classroom. Change ONLY the elephant's skin to the same subtle pale powder light blue as Remy in image 2 (body #B7D6ED, highlights #DAEBF7, shadow #7EA8C7), reduce the grey-lavender cast. Preserve exact pose, smile, eye color, trunk, proportions, texture, pink ears and cheeks, ivory nails and navy tablet. Do not change style or accessories. Keep original transparent background, full character uncut, no text, no new objects. Clean existing stray colored edge pixels while preserving soft silhouette.

## mic

Use case: precise-object-edit. Input image1 is EDIT TARGET: original transparent Remy holding microphone. Input image2 is COLOR REFERENCE ONLY: edited powder light blue Remy holding tablet. Match ONLY skin color of image1 to subtle pale powder light blue of image2 (#B7D6ED body, #DAEBF7 light, #7EA8C7 shaded). Keep precisely original pose, size, face, smile, eyes, trunk, gesture, pink ear interiors, cheek blush, ivory nails, blue microphone and texture. Transparent background, clean soft silhouette, no stray colored pixels, full figure uncropped. No text, no new props, no redesign.
