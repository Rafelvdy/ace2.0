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

// Named export for POST method - Next.js App Router format
export async function POST(request) {
    try {
        // Parse the request body to get requirements
        const { requirements } = await request.json();

        // Validate that requirements are provided
        if (!requirements) {
            return Response.json(
                { error: 'Requirements are required' }, 
                { status: 400 }
            );
        }

        // Make API call to DeepSeek to generate BPMN XML
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT  // Use the actual SYSTEM_PROMPT variable
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
        
        // Extract the generated BPMN XML from the response
        const bpmnXml = response.data.choices[0].message.content.trim();

        // Validate that the response contains valid BPMN XML
        if (!bpmnXml.includes('<?xml') || !bpmnXml.includes('bpmn:')) {
            throw new Error('Generated content is not valid BPMN XML');
        }

        // Return successful response with the generated XML
        return Response.json({ xml: bpmnXml }, { status: 200 });

    } catch (error) {
        console.error('Error generating BPMN:', error);
        
        // Return error response with details
        return Response.json({
            error: 'Failed to generate BPMN diagram',
            details: error.response?.data || error.message
        }, { status: 500 });
    }
}