import fs from 'fs';
import path from 'path';

// Read the source file
const sourceFile = fs.readFileSync('src/js/icons.js', 'utf8');

// Regular expression to match icon components
const iconRegex = /export function (\w+Icon)\(props: IconProps\) {[\s\S]*?return \(([\s\S]*?)\);?\s*}/g;

// Extract all icons
const icons = [];
let match;

while ((match = iconRegex.exec(sourceFile)) !== null) {
    const [_, name, svgContent] = match;
    
    // Format the name to be more readable
    const formattedName = name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/-icon$/, '');

    // Extract the actual SVG content without the surrounding quotes and characters
    let cleanSvg = svgContent.match(/<svg[\s\S]*?<\/svg>/)[0];

    // Clean up the SVG content
    cleanSvg = cleanSvg
        .replace(/\s+/g, ' ')
        .replace(/{\s*size\s*}/g, '24')
        .replace(/{\s*strokeWidth\s*}/g, '1.5')
        .replace(/strokeWidth=/g, 'stroke-width=')
        .replace(/strokeLinecap=/g, 'stroke-linecap=')
        .replace(/strokeLinejoin=/g, 'stroke-linejoin=')
        .replace(/currentColor/g, '#000')
        .replace(/width={[^}]+}/g, 'width="24"')
        .replace(/height={[^}]+}/g, 'height="24"')
        .replace(/{\s*\.\.\.rest\s*}/g, '')
        .replace(/stroke-width=['"]?{[^}]+}['"]?/g, 'stroke-width="1.5"')
        .trim();

    // Ensure proper SVG structure for Figma
    if (!cleanSvg.includes('xmlns=')) {
        cleanSvg = cleanSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Ensure all attributes use double quotes
    cleanSvg = cleanSvg
        .replace(/='([^']*)'/g, '="$1"')
        .replace(/=([^"'\s>]+)/g, '="$1"')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();

    icons.push({
        name: formattedName,
        svg: cleanSvg
    });
}

// Generate the JavaScript code with ES module export
const jsContent = `const icons = ${JSON.stringify(icons, null, 2)};\n\nexport default icons;`;

// Write the output file to the correct location
fs.writeFileSync('src/js/icons.js', jsContent);
console.log('Extracted ' + icons.length + ' icons'); 