const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/lib/database.types.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Extract the tables from graphql_public
const regex = /graphql_public: \{\n\s+Tables: \{\n(\s+debate_topics: \{[\s\S]*?debate_arguments: \{[\s\S]*?\]\n\s+\}\n)\s+\[_ in never\]: never/;
const match = content.match(regex);

if (match) {
  const tablesStr = match[1];
  
  // Remove from graphql_public
  content = content.replace(tablesStr, '');
  
  // Insert into public.Tables
  const publicTablesRegex = /public: \{\n\s+Tables: \{\n/;
  content = content.replace(publicTablesRegex, `public: {\n    Tables: {\n${tablesStr}`);
}

// 2. Add active_session_id to profiles
content = content.replace(/expertise_level: string \| null\n\s+id: string/g, 'expertise_level: string | null\n          active_session_id?: string | null\n          id: string');
content = content.replace(/expertise_level\?: string \| null\n\s+id: string/g, 'expertise_level?: string | null\n          active_session_id?: string | null\n          id: string');
content = content.replace(/expertise_level\?: string \| null\n\s+id\?: string/g, 'expertise_level?: string | null\n          active_session_id?: string | null\n          id?: string');

fs.writeFileSync(file, content);
console.log('Fixed database.types.ts');
