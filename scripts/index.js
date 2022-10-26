import {createMatrix, recommendedMatrix} from './recommender.js';


document.addEventListener('DOMContentLoaded', function () {
  const btnsPrediction = document.querySelectorAll('input[name="prediction"]');
  const btnsMetric = document.querySelectorAll('input[name="metric"]');
  const numOfNeighbours = document.getElementById('numOfNeighbours');

  let results = document.getElementById('results');
  let textMatrix = '';

  document.getElementById('inputMatrixToRead').addEventListener('change', function() {
    const fr = new FileReader();
    fr.onload = function() {
      textMatrix = fr.result;
    }
    fr.readAsText(this.files[0]);
  });

  document.getElementById('doButton').addEventListener('click', function() {
    if (textMatrix == '') {
      results.textContent = 'Adjunta una matriz';
    } else {
      // Se crea la matriz
      let matrix = createMatrix(textMatrix);
      // Se asignan las métricas y el tipo de predicción
      let selectedPrediction = '';
      for (const prediction of btnsPrediction) {
        if (prediction.checked) {
          selectedPrediction = prediction.value;
          break;
        }
      }
      let selectedMetric = '';
      for (const metric of btnsMetric) {
        if (metric.checked) {
          selectedMetric = metric.value;
          break;
        }
      }
      console.log(selectedMetric);
      console.log(selectedPrediction);
      console.log(numOfNeighbours.value);
      console.log(matrix);

      // Calculamos medidas de similitud
      recommendedMatrix(matrix, selectedMetric, selectedPrediction, numOfNeighbours.value);

    }
  });
});