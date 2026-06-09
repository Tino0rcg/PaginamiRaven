const express = require('express');
const path = require('path');
const { WebpayPlus, Options, Environment, IntegrationApiKeys, IntegrationCommerceCodes } = require('transbank-sdk'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar la transacción con el ambiente de integración
const tx = new WebpayPlus.Transaction(new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
));

// Iniciar Transacción WebPay
app.post('/api/checkout', async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ ok: false, error: "Monto inválido" });
        }

        const buyOrder = "RAVEN-" + Math.floor(Math.random() * 1000000);
        const sessionId = "S-" + Math.floor(Math.random() * 1000000);
        
        const protocol = req.protocol;
        const host = req.get('host');
        const returnUrl = `${protocol}://${host}/api/webpay-return`;
        
        const createResponse = await tx.create(
            buyOrder,
            sessionId,
            amount,
            returnUrl
        );

        res.json({
            ok: true,
            url: createResponse.url,
            token: createResponse.token
        });

    } catch (error) {
        console.error("Error al crear la transacción:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Confirmar Transacción (Redirección desde WebPay)
app.post('/api/webpay-return', async (req, res) => {
    try {
        const token = req.body.token_ws;
        
        // Si el usuario cancela en el portal de pago (Transbank envía TBK_TOKEN en lugar de token_ws)
        if (req.body.TBK_TOKEN || !token) {
             return res.redirect('/failure.html?reason=aborted');
        }

        const commitResponse = await tx.commit(token);
        
        if (commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED') {
            // Pago Exitoso
            res.redirect(`/success.html?amount=${commitResponse.amount}&buyOrder=${commitResponse.buy_order}&authCode=${commitResponse.authorization_code}`);
        } else {
            // Pago Rechazado por fondos u otros motivos
            res.redirect('/failure.html?reason=rejected');
        }

    } catch (error) {
        console.error("Error al confirmar transacción:", error);
        res.redirect('/failure.html?reason=error');
    }
});

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en http://localhost:${PORT}`);
});
