#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sharedDir = path.join(root, 'shared', 'gradecrew-design');
const generatedDir = path.join(root, 'generated');
const nativeSharedDir = path.join(root, 'native', 'Shared');

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(sharedDir, name), 'utf8'));
const tokens = readJson('tokens.json');
const assets = readJson('assets.json');

fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(nativeSharedDir, { recursive: true });

const kebab = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const swiftName = (value) => value.replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase());
const px = (value) => `${value}px`;

function flatten(object, prefix = []) {
  return Object.entries(object).flatMap(([key, value]) => {
    const next = [...prefix, key];
    return value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, next)
      : [[next, value]];
  });
}

const cssLines = [
  '/* GENERATED FILE. Edit shared/gradecrew-design/tokens.json instead. */',
  `/* GradeCrew Design System ${tokens.version} */`,
  ':root {'
];
for (const [parts, value] of flatten({
  colors: tokens.colors,
  radius: tokens.radius,
  spacing: tokens.spacing,
  layout: tokens.layout,
  typography: tokens.typography,
  motion: tokens.motion,
  shadows: tokens.shadows
})) {
  const name = `--gc-${parts.map(kebab).join('-')}`;
  let rendered = value;
  if (parts[0] === 'radius' || parts[0] === 'spacing' || parts[0] === 'layout' || parts[0] === 'typography') {
    rendered = typeof value === 'number' ? px(value) : value;
  }
  if (parts[0] === 'motion' && parts.at(-1).endsWith('Ms')) rendered = `${value}ms`;
  if (typeof value === 'boolean') rendered = value ? '1' : '0';
  cssLines.push(`  ${name}: ${rendered};`);
}
cssLines.push('}', '');
fs.writeFileSync(path.join(generatedDir, 'gradecrew-design-tokens.css'), cssLines.join('\n'));

const assetMap = {};
for (const [groupName, group] of Object.entries(assets)) {
  if (!group || typeof group !== 'object' || Array.isArray(group) || groupName === 'rules') continue;
  if (groupName === 'brand' || groupName === 'scenes') {
    assetMap[groupName] = Object.fromEntries(Object.entries(group).map(([key, file]) => [key, `${assets.root}/${file}`]));
  }
}
assetMap.mascots = Object.fromEntries(Object.entries(assets.mascots).map(([name, mascot]) => [
  name,
  Object.fromEntries(Object.entries(mascot).map(([key, value]) => [
    key,
    key === 'role' || key === 'animal' ? value : `${assets.root}/${value}`
  ]))
]));

for (const [, value] of flatten(assetMap)) {
  if (typeof value !== 'string' || !value.startsWith(`${assets.root}/`)) continue;
  const absolute = path.join(root, value);
  if (!fs.existsSync(absolute)) throw new Error(`Missing canonical GradeCrew asset: ${value}`);
}

fs.writeFileSync(
  path.join(generatedDir, 'gradecrew-assets.js'),
  `// GENERATED FILE. Edit shared/gradecrew-design/assets.json instead.\nexport const GRADECREW_ASSETS = ${JSON.stringify(assetMap, null, 2)};\n`
);

function swiftColor(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `Color(red: ${r}.0 / 255.0, green: ${g}.0 / 255.0, blue: ${b}.0 / 255.0)`;
}

const swift = [
  '// GENERATED FILE. Edit shared/gradecrew-design/tokens.json instead.',
  'import SwiftUI',
  '',
  'enum GradeCrewDesignTokens {',
  `    static let version = "${tokens.version}"`,
  '',
  '    enum Colors {'
];
for (const [name, hex] of Object.entries(tokens.colors)) swift.push(`        static let ${swiftName(name)} = ${swiftColor(hex)}`);
swift.push('    }', '', '    enum Radius {');
for (const [name, value] of Object.entries(tokens.radius)) swift.push(`        static let ${swiftName(name)}: CGFloat = ${value}`);
swift.push('    }', '', '    enum Spacing {');
for (const [name, value] of Object.entries(tokens.spacing)) swift.push(`        static let ${swiftName(name)}: CGFloat = ${value}`);
swift.push('    }', '', '    enum Layout {');
for (const [name, value] of Object.entries(tokens.layout)) swift.push(`        static let ${swiftName(name)}: CGFloat = ${value}`);
swift.push('    }', '', '    enum Typography {');
for (const [name, value] of Object.entries(tokens.typography)) if (typeof value === 'number') swift.push(`        static let ${swiftName(name)}: CGFloat = ${value}`);
swift.push('    }', '}', '');
fs.writeFileSync(path.join(nativeSharedDir, 'GradeCrewDesignTokens.swift'), swift.join('\n'));

const swiftAssets = [
  '// GENERATED FILE. Edit shared/gradecrew-design/assets.json instead.',
  'import Foundation',
  '',
  'enum GradeCrewAssets {',
  `    static let version = "${assets.version}"`,
  `    static let sourceRoot = "${assets.root}"`,
  ''
];
for (const [name, mascot] of Object.entries(assetMap.mascots)) {
  swiftAssets.push(`    enum ${name[0].toUpperCase()}${name.slice(1)} {`);
  for (const [key, value] of Object.entries(mascot)) swiftAssets.push(`        static let ${swiftName(key)} = "${value}"`);
  swiftAssets.push('    }', '');
}
swiftAssets.push('}', '');
fs.writeFileSync(path.join(nativeSharedDir, 'GradeCrewAssets.swift'), swiftAssets.join('\n'));

console.log(`Generated GradeCrew design system ${tokens.version}.`);
