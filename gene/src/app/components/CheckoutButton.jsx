    // components/CheckoutButton.js

    function CheckoutButton() {
        const handleClick = async () => {
        try {
            const response = await fetch('/api/payment-intent', {
            method: 'POST',
            });
    
            if (!response.ok) {
            throw new Error('Failed to create payment intent');
            }
    
            const data = await response.json();
            const { clientSecret } = data;
    
        } catch (error) {
            console.error(error);
        }
        };
    
        return (
        <button onClick={handleClick}>
            Checkout
        </button>
        );
    }
    
    export default CheckoutButton;
    