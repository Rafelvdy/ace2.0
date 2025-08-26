import axios from "axios";

//System prompt that is appended to generate the BPMN XML
const SYSTEM_PROMPT = `
You are a BPMN (Business Process Model and Notation) expert specializing in insurance claims automation. 
Your task is to convert natural language requirements into valid BPMN 2.0 XML that represents automated decision workflows for insurance claims processing.

Key requirements:
1. Always start with a Start Event and end with End Events
2. Use Exclusive Gateways for decision points with conditions
3. Use Service Tasks for automated processes
4. Use User Tasks for manual interventions/escalations  
5. Include proper sequence flows with conditions
6. Follow BPMN 2.0 XML schema strictly
7. Focus on claims automation scenarios (approval/rejection/escalation)

Example structure for insurance claims:
- Start Event → Initial Assessment (Service Task) → Decision Gateway → Approval/Rejection/Escalation paths

Always respond with valid BPMN 2.0 XML only, no additional text or explanations.
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { requirements } = req.body;

    if (!requirements) {
        return res.status(400).json({ error: 'Requirements are required' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'SYSTEM_PROMPT'
                },
                {
                    role: 'user',
                    content: `Convert the following insurance claims automation requirements into BPMN 2.0 XML:
          
                    ${requirements}
                    
                    Generate a complete BPMN diagram that automates the described process with proper decision gates, service tasks, and escalation paths.`
                }
            ],
            temperature: 0.3,
            max_tokens: 2000,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        
        const bpmnXml = response.data.choices[0].message.content.trim();

        if (!bpmnXml.includes('<?xml') || !bpmnXml.includes('bpmn:')) {
            throw new Error('Generated content is not valid BPMN XML');
        }

        res.status(200).json({ xml: bpmnXml });

    } catch (error) {
        console.error('Error generating BPMN:', error);
        res.status(500).json({
            error: 'Failed to generate BPMN diagram',
            details: error.response?.data || error.message
        });
    }
}