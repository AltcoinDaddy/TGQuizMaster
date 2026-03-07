import axios from 'axios';
import { decode } from 'html-entities';

const CATEGORY_MAP: Record<string, number> = {
    'General': 9,
    'Crypto': 18, // Science: Computers
    'Movies': 11,
    'Sports': 21,
    'Gaming': 15
};

async function testOpenTDB(category: string = 'General', count: number = 5) {
    const categoryId = CATEGORY_MAP[category] || 9;
    const url = `https://opentdb.com/api.php?amount=${count}&category=${categoryId}&type=multiple`;

    console.log(`Testing OpenTDB fetch for category: ${category} (ID: ${categoryId})`);
    console.log(`URL: ${url}`);

    try {
        const resp = await axios.get(url);
        if (resp.data.results && resp.data.results.length > 0) {
            console.log(`Successfully fetched ${resp.data.results.length} questions.`);
            resp.data.results.forEach((q: any, i: number) => {
                console.log(`\nQuestion ${i + 1}: ${decode(q.question)}`);
                console.log(`Correct Answer: ${decode(q.correct_answer)}`);
            });
        } else {
            console.log('No results found or error code:', resp.data.response_code);
        }
    } catch (error: any) {
        console.error('Fetch failed:', error.message);
    }
}

// Run test
const args = process.argv.slice(2);
const category = args[0] || 'Crypto';
testOpenTDB(category);
