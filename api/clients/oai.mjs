import 'dotenv/config';
import { AzureOpenAI } from 'openai';

const DEFAULT_MODEL = 'o1';
const OPENAI_MODEL_CONFIGS = {
    o1: {
        endpoint: process.env.OPENAI_ENDPOINT_o1,
        apiKey: process.env.OPENAI_TOKEN_o1,
        apiVersion: '2024-09-01-preview',
    },
    gpt4o: {
        endpoint: process.env.OPENAI_ENDPOINT_gpt4o,
        apiKey: process.env.OPENAI_TOKEN_gpt4o,
        apiVersion: '2024-09-01-preview',
    },
};

const getOpenAIClient = (configName) => {
    const config = OPENAI_MODEL_CONFIGS[configName];
    console.log(config);
    return new AzureOpenAI(config);
};

export const runLLMCompletion = async (messages, modelName = DEFAULT_MODEL) => {
    if (!messages) {
        return { error: 'No messages provided!' };
    }
    try {
        const openai = getOpenAIClient(modelName);
        const result = await openai.chat.completions.create({
            messages,
        });
        return {
            text: result.choices[0].message.content,
        };
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
};
