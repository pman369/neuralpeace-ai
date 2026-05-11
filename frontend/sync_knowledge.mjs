import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vebgatsavuxliewemioe.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlYmdhdHNhdnV4bGlld2VtaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYxNDc1NSwiZXhwIjoyMDkxMTkwNzU1fQ.ZAJaf0Q7Z-Vp36ZsnEXG83lW1MHagrJ3Cr8HSNsr4NE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MODULE_METADATA = {
    "Prefrontal Cortex Synthesis": {"category": "Neuroanatomy", "expertise": "Practitioner", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAX-I9GoYGWxxH5u-WDZfkverd7sBcrdRFw5SMIFVbcbFjJNU6ua1h3TXFaDAQ7KOkPd5gMaSdrTXZbb_Wv-GMKqzMGyQAuSmyN8UaWkFhCxrc4hi031Ct4QCzEPQkka9y-DRtCeW86toX1FZeL27VW6ZP_QytMmad3H9v-G2oZw3D69D8H6IquU1GsjCkmjVV_oks1RS6HK0oGvqTHSnVcxyHt493m93gc_Tpc70-O1tXdMV4NPvgELFxglDL6b16HCtNVa25FGVo", "read_time": "12 mins read", "description": "A comprehensive look at executive function regulation through the lens of modern connectivity mapping."},
    "Bayesian Inference Models": {"category": "Computational", "expertise": "Expert", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuD01a97ejCpwS8UU5BQogY28YZ8ojgntR7e7P94-W61ctJqMzy9KBonBo038wSniM8IMx8uFeiBTN2oMaQEwnc63oLEaZ-bxt6yy2Cknbsu-oriQxhSfMmoXpDvECXa4r4zhW5j08ABoXwCt_RMnDnSEtyA35RAQQC4RPEONQ-HBmStXl-a-yZX_nNCopEI_JrFkRMiD-pY82ElAf6YcILfGjkjZLwRtHmIAKcP4rp23xjG8ZKd0k3cOkvL8jQx0oDJLOfQXWSynGo", "read_time": "25 mins read", "description": "How probabilistic modeling predicts sensory perception and motor control in complex environmental states."},
    "fMRI Protocol Basics": {"category": "Methods", "expertise": "Novice", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuARoQzCDMjoEGixktInclp5bk4NuggHUedO8vZS3HPTmZOFzVDGPknGCQWzBWW_up8COPyZrMxr7UsXyX0gwflo--HziTNm-ObloYL6RGIfz04bAJ68vLnCFWzwGU_E5zTS9o73FydYZ1OZQUImMICqt2GBKN3GKWcZRpp1tTOV8WNC3ftXY-svo0sqzQCATJbYa-PnkKuWH_RG7rX1gKynuIbRTZhnCC78lupbAk6nGE5Xm-ligWkRJcR1fyVuX9jrFVpz-BD2Ygs", "read_time": "8 mins read", "description": "A beginner-friendly guide to experimental design and initial data cleaning for functional neuroimaging."},
    "Cognitive Load Theory": {"category": "Psychology", "expertise": "Practitioner", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAGw8eSfdM6ig4cdutozUjMmzYNJ27utbPankUvID8mdsSIEzxHDIaXsOl8xsSvj-nFCAS-O5b_sAfOqDeUcVo68XD6fuuxEcq8islQntALhFi-d3HRmNaxxojuYgKyyZqjKLyYQSo-G2Cd-Uv2v2qjjGwRBPKbzRBv7Cn7MaGcUeiusfRuKeiErYw4qrA8zV-21oTuNn8a8FDyYKq_cIZ3ERQs3uYbMOjkusYV8lPNkuKVyvLZ1bzRnuDRSHKGcZE3ZH2tjngTtCU", "read_time": "15 mins read", "description": "Analyzing the relationship between working memory capacity and instructional design efficiency."},
    "Hippocampal Neurogenesis": {"category": "Neuroanatomy", "expertise": "Expert", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBlD65-tFVnddScEFV2TrMxN0yR3iPc9KAm14Mh-ZdkHyUy_SQlBcxky4QzSnfPj3lsPYvseuRLsgw9WH5uADRthjYP57km-MUFYBwKr6KgHnI5YV8ZXjXv-ZtZMX1Q6mYHZ5q3R4GhqZewy3SYFFJwiVGcNFCz40Zb3H7KTSiXWS1sZVWmLKYmt7AnFr82PWvdpUxJd8MXgy368clSUn43wtnKJuj3dZUJKbgyzYlunkJkinwRH2TAuNQROZonxDqS0_pdpsIg_V4", "read_time": "40 mins read", "description": "Advanced study on the biological mechanisms of adult neuron formation and memory consolidation."},
    "Introduction to Neurofeedback": {"category": "Therapeutics", "expertise": "Novice", "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCK7YN18eAeLEdwxTZ-J8Zg1DhStYVpseTRfuLol3HLZrUChzoPbMc7WZ3mvDkHnh0TULgt6ZfOm9Cx7boPftP58TFyXE4zyYoP0q4TyjdFUs2cZMIEYlG_cdU7Sh4g_g2KvoKP9tgZmJnWI7ol2hTHl44iSKWVdOC6Y4-rPf_wwWvyYk9zfdIc1PQcUTpamtsuDf5cJUf3WWrTe8e3X9s1a59IbT9SphdaszUi6tyhzQ9TOTVNTmD5x51sGPDq7-eK1hwMKLsEY5w", "read_time": "10 mins read", "description": "Understanding the basics of EEG-driven therapeutic interventions for anxiety and sleep regulation."}
};

function parseMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (!h1Match) return null;
    
    const moduleTitleRaw = h1Match[1].trim();
    const baseName = path.basename(filePath, '.md');
    
    let meta = MODULE_METADATA[moduleTitleRaw] || MODULE_METADATA[baseName];
    const moduleTitle = meta ? (MODULE_METADATA[moduleTitleRaw] ? moduleTitleRaw : baseName) : moduleTitleRaw;
    
    // Extract intro text
    const introMatch = content.match(/^#\s+.*?\r?\n+([\s\S]*?)(?=\r?\n##\s+|$)/);
    const introText = introMatch ? introMatch[1].trim() : "";
    
    let description, category, expertise, imageUrl, readTime;
    
    if (meta) {
        description = meta.description;
        category = meta.category;
        expertise = meta.expertise;
        imageUrl = meta.image_url;
        readTime = meta.read_time;
    } else {
        description = introText.length > 200 ? introText.substring(0, 200) + "..." : introText;
        if (!description) description = "Educational module about " + moduleTitle;
        category = "Neuroanatomy";
        expertise = "Expert"; // Default to Expert
        imageUrl = "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800";
        readTime = "15 mins read";
    }

    const sections = [];
    if (introText) {
        sections.push({
            title: 'Introduction',
            order: 0,
            content: introText
        });
    }
    
    const regex = /^##\s+(.+?)\r?\n([\s\S]*?)(?=\r?\n##\s+|$)/gm;
    let match;
    let order = 1;
    while ((match = regex.exec(content)) !== null) {
        sections.push({
            title: match[1].trim(),
            order: order++,
            content: match[2].trim()
        });
    }
    
    return {
        title: moduleTitle,
        description,
        category,
        expertise,
        image_url: imageUrl,
        read_time: readTime,
        sections
    };
}

async function triggerEmbedding(sectionId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/embed-knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ action: 'sync', sectionId: sectionId })
        });
        if (response.ok) {
            console.log(`    Successfully triggered embedding for ${sectionId}`);
        } else {
            console.log(`    Failed to trigger embedding for ${sectionId}: ${await response.text()}`);
        }
    } catch (e) {
        console.log(`    Error triggering embedding: ${e}`);
    }
}

async function syncModule(moduleData) {
    console.log(`Syncing module: ${moduleData.title}...`);
    
    let modData;
    let modError;
    
    const { data: existingMods } = await supabase
        .from('modules')
        .select('id')
        .eq('title', moduleData.title);
        
    if (existingMods && existingMods.length > 0) {
        const { data, error } = await supabase
            .from('modules')
            .update({
                description: moduleData.description,
                category: moduleData.category,
                expertise: moduleData.expertise,
                image_url: moduleData.image_url,
                read_time: moduleData.read_time
            })
            .eq('id', existingMods[0].id)
            .select();
        modData = data;
        modError = error;
    } else {
        const { data, error } = await supabase
            .from('modules')
            .insert({
                title: moduleData.title,
                description: moduleData.description,
                category: moduleData.category,
                expertise: moduleData.expertise,
                image_url: moduleData.image_url,
                read_time: moduleData.read_time
            })
            .select();
        modData = data;
        modError = error;
    }
        
    if (modError || !modData || modData.length === 0) {
        console.error(`Error saving module ${moduleData.title}`, modError);
        return;
    }
    
    const moduleId = modData[0].id;
    
    // Delete existing sections for this module to avoid constraint errors
    await supabase
        .from('module_content')
        .delete()
        .eq('module_id', moduleId);
        
    for (const section of moduleData.sections) {
        console.log(`  Syncing section: ${section.title}...`);
        const { data: secData, error: secError } = await supabase
            .from('module_content')
            .insert({
                module_id: moduleId,
                section_title: section.title,
                section_order: section.order,
                content_md: section.content
            })
            .select();
            
        if (secData && secData.length > 0) {
            await triggerEmbedding(secData[0].id);
        } else {
            console.error(`  Error inserting section ${section.title}`, secError);
        }
    }
}

async function run() {
    const knowledgeDir = path.join(process.cwd(), '../knowledge_base');
    const files = fs.readdirSync(knowledgeDir);
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const data = parseMarkdown(path.join(knowledgeDir, file));
            if (data) {
                await syncModule(data);
            }
        }
    }
    console.log('Sync complete.');
}

run();
