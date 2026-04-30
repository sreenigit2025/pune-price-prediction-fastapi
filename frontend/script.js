const API_URL = "/predict";

const form = document.getElementById('property-form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const loading = document.getElementById('loading');
        const errorMsg = document.getElementById('error-msg');

        errorMsg.classList.add('hidden');
        submitBtn.classList.add('hidden');
        loading.classList.remove('hidden');

        const formData = new FormData(form);

        const payload = {
            property_type: parseInt(formData.get('property_type')),
            area: parseFloat(formData.get('area')),
            sub_area: formData.get('sub_area'),
            description: formData.get('description'),
            clubhouse: formData.get('clubhouse') ? 1 : 0,
            school: formData.get('school') ? 1 : 0,
            hospital: formData.get('hospital') ? 1 : 0,
            mall: formData.get('mall') ? 1 : 0,
            park: formData.get('park') ? 1 : 0,
            pool: formData.get('pool') ? 1 : 0,
            gym: formData.get('gym') ? 1 : 0
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Prediction failed');
            }

            sessionStorage.setItem('predictionResult', JSON.stringify(data));
            window.location.href = '/results';

        } catch (error) {
            console.error("Error:", error);
            errorMsg.textContent = "Failed to get prediction from backend.";
            errorMsg.classList.remove('hidden');
            submitBtn.classList.remove('hidden');
            loading.classList.add('hidden');
        }
    });
}

if (window.location.pathname === '/results') {
    const resultData = sessionStorage.getItem('predictionResult');

    if (!resultData) {
        window.location.href = '/';
    } else {
        const parsedData = JSON.parse(resultData);

        document.getElementById('predicted-price').textContent =
            `₹${parsedData.predicted_price.toLocaleString('en-IN')} Lakhs`;
        document.getElementById('lower-bound').textContent =
            `₹${parsedData.lower_bound.toLocaleString('en-IN')} L`;
        document.getElementById('upper-bound').textContent =
            `₹${parsedData.upper_bound.toLocaleString('en-IN')} L`;
        document.getElementById('features-used').textContent =
            parsedData.features_used;
    }
}