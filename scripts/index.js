import {createMatrix, recommendedMatrix} from './recommender.js';

document.addEventListener('DOMContentLoaded', function () {
  const btnsPrediction = document.querySelectorAll('input[name="prediction"]');
  const btnsMetric = document.querySelectorAll('input[name="metric"]');
  const numOfNeighbours = document.getElementById('numOfNeighbours');

  const outputResults = document.getElementById('outputResults');
  const outputWarning = document.getElementById('warning');
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
      outputWarning.innerHTML = 'Adjunta una matriz';
    } else {
      outputWarning.innerHTML = '';
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

      // Calculamos medidas de similitud y obtenemos los resultados
      const fullResults = recommendedMatrix(matrix, selectedMetric, selectedPrediction, numOfNeighbours.value);
      const rMatrix = fullResults.matrix;
      // console.log(rMatrix);
      
      // Mostramos los resultados
      outputResults.style.display = "block";
      let h2Results = document.createElement('h2');
      let infoResults = document.createElement('p');
      let h3Results = document.createElement('h3');
      h2Results.innerHTML = "Resultados del filtrado colaborativo:";
      infoResults.innerHTML = 
        `Métrica: ${selectedMetric}, Predicción: ${selectedPrediction}, NºVecinos: ${numOfNeighbours.value}`;
      h3Results.innerHTML = "Matriz de utilidad:";
      outputResults.appendChild(h2Results);
      outputResults.appendChild(infoResults);
      outputResults.appendChild(h3Results);

      // Mostramos la matriz de utilidad
      let tbl = document.createElement('table');
      for (let i = 0; i < rMatrix.length; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < rMatrix[0].length; j++) {
          const td = tr.insertCell();
          td.appendChild(document.createTextNode(rMatrix[i][j]));
        }
      }
      outputResults.appendChild(tbl);
    }
  });
});