const fs = require('fs');
const path = require('path');

function removeDuplicateKeys(jsonString) {
  // Parse JSON manteniendo el orden y removiendo duplicados
  const lines = jsonString.split('\n');
  const result = [];
  const seenKeys = new Map(); // Mapa para rastrear claves por nivel de anidación
  const indentStack = []; // Stack para rastrear niveles de anidación
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)[1].length;
    
    // Actualizar stack de indentación
    while (indentStack.length > 0 && indentStack[indentStack.length - 1].indent >= indent) {
      const popped = indentStack.pop();
      // Limpiar claves del nivel que estamos saliendo
      for (const key of popped.keys) {
        seenKeys.delete(key);
      }
    }
    
    // Detectar si es una línea con clave
    const keyMatch = line.match(/^(\s*)"([^"]+)"\s*:/);
    if (keyMatch) {
      const key = keyMatch[2];
      const fullKey = `${indent}-${key}`;
      
      if (seenKeys.has(fullKey)) {
        // Es una clave duplicada, saltarla
        console.log(`Removiendo clave duplicada: "${key}" en línea ${i + 1}`);
        
        // Si es un objeto, necesitamos saltar todo el bloque
        if (line.includes('{')) {
          let bracketCount = 1;
          let j = i + 1;
          while (j < lines.length && bracketCount > 0) {
            const nextLine = lines[j];
            if (nextLine.includes('{')) bracketCount++;
            if (nextLine.includes('}')) bracketCount--;
            j++;
          }
          i = j - 1; // Saltar todo el bloque
        }
        continue;
      }
      
      seenKeys.set(fullKey, true);
      
      // Agregar al stack actual
      if (indentStack.length === 0 || indentStack[indentStack.length - 1].indent < indent) {
        indentStack.push({ indent, keys: [fullKey] });
      } else {
        indentStack[indentStack.length - 1].keys.push(fullKey);
      }
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

// Procesar todos los archivos de idioma
const locales = ['es', 'en', 'de', 'fr', 'it', 'pt'];

console.log('🧹 Limpiando claves duplicadas en archivos de traducción...\n');

locales.forEach(locale => {
  const filePath = path.join(__dirname, '..', 'src', 'locales', `${locale}.json`);
  
  try {
    console.log(`📝 Procesando ${locale}.json...`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Limpiar duplicados
    const cleaned = removeDuplicateKeys(content);
    
    // Verificar que el JSON resultante sea válido
    JSON.parse(cleaned);
    
    // Escribir archivo limpio
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✅ ${locale}.json - Duplicados removidos y archivo válido`);
    
  } catch (error) {
    console.log(`❌ ${locale}.json - Error: ${error.message}`);
  }
});

console.log('\n🎉 Limpieza completada!');
