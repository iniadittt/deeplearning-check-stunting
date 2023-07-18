const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

const app = express();
const PORT = 5000;
app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).json({ 'StatusCode': 200, 'Message': 'Hello! Server Connected!' })
})

app.post('/predict', async(req, res) => {
    const { gender, age, birthWeight, birthLength, bodyWeight, bodyLength, asiEksklusif } = req.body;
    const sex = gender === 'Laki-laki' ? 1 : gender === 'Perempuan' ? 0 : 'undefined';
    const ASI = asiEksklusif === 'Yes' ? 1 : asiEksklusif === 'No' ? 0 : 'undefined';
    const inputRequest = [sex, age, birthWeight, birthLength, bodyWeight, bodyLength, ASI]
    for (let i = 0; i < inputRequest.length; i++) {
        if (inputRequest[i] === 'undefined') {
            return res.status(404).json({ 'StatusCode': 400, 'Message': 'Data yang dimasukkan tidak sesuai' });
        }
    }
    const inputData = tf.tensor2d([inputRequest]);
    const modelPath = './model/';
    const model = await tf.loadGraphModel(`file://${modelPath}/model.json`);
    const prediction = model.predict(inputData);
    const predicted = prediction.dataSync()[0];
    const valuePredicted = parseInt(predicted * 100);
    const result = valuePredicted <= 50 ? 'Tidak Stunting' : 'Stunting'
    res.status(200).json({ 'StatusCode': 200, 'Message': 'Berhasil mendapatkan response dari Model Deeplearning', data: { requestData: req.body, responseData: result, presentaseStunting: valuePredicted } });
});

app.listen(PORT, () => console.log(`Server berjalan pada port ${PORT}`));