    import { currentUser } from '@clerk/nextjs';

    const SignUpHandler = async () => {
    try {
        const user = await currentUser();

        // Construct the API endpoint URL
        const apiUrl = 'http://localhost:3000/api/get-user';


        // Send a POST request to your API endpoint to store user data
        const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: user.id,
            email: user.emailAddress,
            name: user.firstName,
        }),
        });

        if (!response.ok) {
        throw new Error(`Failed to store user data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error storing user data:', error);
    }

    return null;
    };

    export default SignUpHandler;
