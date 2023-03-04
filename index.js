import {ChatGPTUnofficialProxyAPI, ChatGPTAPI} from 'chatgpt'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv-safe'
import { Configuration, OpenAIApi } from "openai";
import pkg from 'openai';
const { CreateImageRequest, CreateImageRequestResponseFormatEnum } = pkg;



dotenv.config()
const cfg = new Configuration({
    organization: process.env.ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});


const app = express()
const port = 9000
app.use(cors())
app.use(express.json());

app.post('/chatbyproxy', async (req, res) => {
    const prompt = req.body.prompt
    const conversationId = req.body.conversationId
    const parentMessageId = req.body.parentMessageId
    let text = await callChatGPTByProxy(prompt, conversationId, parentMessageId)
    res.json(text)
})

app.post('/chat', async (req, res) => {
    const prompt = req.body.prompt
    const conversationId = req.body.conversationId
    const parentMessageId = req.body.parentMessageId
    let text = await callChatGPT(prompt, conversationId, parentMessageId)
    res.json(text)
})

app.get('/', async (req, res) => {
    let text = await callChatGPTByProxy("你是谁")
    res.json(text)
})

app.post('/image', async (req, res) => {
    let text = await callOpenAICreateImage(req.body.prompt)
    res.json(text)
})

app.listen(port, () => {
    console.log(`chatgpt app listening at http://localhost:${port}`)
})

async function callChatGPT(prompt, conversationId, parentMessageId) {
    const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })

    console.log('request: ' + prompt + '\n')
    let res = await api.sendMessage(prompt, {
        conversationId: conversationId,
        parentMessageId: parentMessageId
    })
    console.log('response: ' + res.text + '\n')

    return res
}

async function callChatGPTByProxy(prompt, conversationId, parentMessageId) {
    const api = new ChatGPTUnofficialProxyAPI({
        apiReverseProxyUrl: process.env.ReverseProxyUrl,
        accessToken: process.env.OPENAI_ACCESS_TOKEN,
        debug: false
    })

    console.log('request: ' + prompt + '\n')
    let res = await api.sendMessage(prompt, {
        conversationId: conversationId,
        parentMessageId: parentMessageId
    })
    console.log('response: ' + res.text + '\n')

    return res
}

async function callOpenAICreateImage(prompt, ) {
    const openai = new OpenAIApi(cfg);
    let imgReq;
    imgReq = {
        prompt: prompt,
        response_format: CreateImageRequestResponseFormatEnum.Url,
        n: 1
    };
    const response = await openai.createImage(imgReq)
    return response.data;
}