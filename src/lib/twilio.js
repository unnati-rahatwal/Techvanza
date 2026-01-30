import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        return message;
    } catch (error) {
        console.error('Error sending SMS:', error);
        return null; // Don't break the flow
    }
};

export const makeCall = async (to, text) => {
    try {
        // Using Polly.Aditi for Indian English accent
        const twiml = `<Response>
            <Say voice="Polly.Aditi" language="en-IN">${text}</Say>
        </Response>`;
        
        const call = await client.calls.create({
            twiml: twiml,
            to: to,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        return call;
    } catch (error) {
        console.error('Error making call:', error);
        return null;
    }
};
