document.addEventListener('DOMContentLoaded', () => {
    const resultElement = document.getElementById('barcode-result');
    const videoElement = document.getElementById('video');

    // Initialize Camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
        .then((stream) => {
            videoElement.srcObject = stream;

            // Initialize Quagga
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: videoElement, // Bind to video element
                    constraints: {
                        facingMode: "environment" // Use back camera
                    }
                },
                decoder: {
                    readers: ["ean_reader"] // Support for EAN-13 barcodes
                }
            }, (err) => {
                if (err) {
                    console.error("Quagga initialization error:", err);
                    alert("Error initializing scanner. Please refresh the page.");
                    return;
                }
                Quagga.start(); // Start the scanner
            });

            // Detect Barcodes
            Quagga.onDetected((data) => {
                const barcode = data.codeResult.code;

                // Show the detected barcode
                resultElement.innerText = `Barcode detected: ${barcode}`;

                // Query Open Food Facts API
                fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.product) {
                            resultElement.innerText = `Product Found: ${data.product.product_name}`;
                        } else {
                            resultElement.innerText = 'Product not found in database.';
                        }
                    })
                    .catch(error => {
                        console.error('Error querying Open Food Facts API:', error);
                        resultElement.innerText = 'Error querying the database.';
                    });

                // Stop the scanner after detection
                Quagga.stop();
            });
        })
        .catch((error) => {
            console.error("Camera access denied:", error);
            alert("Please allow camera access for this feature to work.");
        });
});
