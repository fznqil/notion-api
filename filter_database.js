const axios = require('axios');
require('dotenv').config();

const notionToken = 'process.env.NOTION_TOKEN';
const databaseId = 'process.env.DATABASE_ID';

const notion = axios.create({
    baseURL: 'https://api.notion.com/v1/',
    headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28'
    }
});

async function getDatabaseEntries() {
    try {
        const response = await notion.post(`databases/${databaseId}/query`);
        return response.data.results;
    } catch (error) {
        console.error('Error fetching database entries:', error);
        return [];
    }
}

async function deletePage(pageId) {
    try {
        await notion.patch(`pages/${pageId}`, {
            archived: true
        });
        console.log(`Deleted page: ${pageId}`);
    } catch (error) {
        console.error(`Error deleting page ${pageId}:`, error);
    }
}

async function clearOldEntries() {
    const entries = await getDatabaseEntries();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    for (const entry of entries) {
        const createdTime = new Date(entry.created_time);
        if (createdTime < twoWeeksAgo) {
            await deletePage(entry.id);
        }
    }
}

clearOldEntries();