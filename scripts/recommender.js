/**
 * 
 * @param {*} stringMatrix 
 * @returns 
 */
export function createMatrix(stringMatrix) {
  let matrix = [];
  let numOfCols = 0; 
  let numOfRows = 0;

  // Calculamos el número de filas y columnas
  let stringRowsArray = stringMatrix.split("\r\n");
  numOfRows = stringRowsArray.length;
  numOfCols = stringRowsArray[0].split(" ").length;

  // Ingresamos los valores en la matriz
  for (let i = 0; i < numOfRows; i++) {
    let row = stringRowsArray[i].split(" ");
    matrix.push(row);
  }

  return matrix;
}


function calculateMean(reviewScores, itemsReviewed) {
  let sum = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    sum += parseFloat(reviewScores[itemsReviewed[i]]);
  }
  return sum / itemsReviewed.length;
}


function calculatePearsonSimilarity(u, v, itemsReviewed, matrix) {
  // Calculamos la media del usuario u y v
  const uMean = calculateMean(matrix[u], itemsReviewed);
  const vMean = calculateMean(matrix[v], itemsReviewed);

  // Calculamos la correlación de Pearson
  let divisor = 0;
  let dividend1 = 0, dividend2 = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    divisor += (parseFloat(matrix[u][itemsReviewed[i]]) - uMean) * (parseFloat(matrix[v][itemsReviewed[i]]) - vMean);
    dividend1 += Math.pow(parseFloat(matrix[u][itemsReviewed[i]]) - uMean, 2);
    dividend2 += Math.pow(parseFloat(matrix[v][itemsReviewed[i]]) - vMean, 2);
  }

  return divisor / (Math.sqrt(dividend1) * Math.sqrt(dividend2));
}


function calculateCosineDistance(u, v, itemsReviewed, matrix) {
  // Calculamos la Distancia Coseno
  let divisor = 0;
  let dividend1 = 0, dividend2 = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    divisor += parseFloat(matrix[u][itemsReviewed[i]]) * parseFloat(matrix[v][itemsReviewed[i]]);
    dividend1 += Math.pow(parseFloat(matrix[u][itemsReviewed[i]]), 2);
    dividend2 += Math.pow(parseFloat(matrix[v][itemsReviewed[i]]), 2);
  }

  return divisor / (Math.sqrt(dividend1) * Math.sqrt(dividend2));
}


function calculateEuclideanDistance(u, v, itemsReviewed, matrix) {
  // Calculamos la Distancia Euclídea
  let sum = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    sum += Math.pow(parseFloat(matrix[u][itemsReviewed[i]]) - parseFloat(matrix[v][itemsReviewed[i]]), 2);
  }

  return Math.sqrt(dividend1) * Math.sqrt(dividend2);
}


function calculateSimplePrediction(closestNeighbours, item, matrix) {
  let sum1 = 0, sum2 = 0;
  for (let x = 0; x < closestNeighbours.length; x++) {
    sum1 += closestNeighbours[x].sim * matrix[closestNeighbours[x].user][item]
    sum2 += closestNeighbours[x].sim
  }
  return sum1 / sum2;
}


function calculateMeanDiffPrediction(closestNeighbours, item, itemsReviewed, matrix) {
  let sum1 = 0, sum2 = 0;
  for (let v = 0; v < closestNeighbours.length; v++) {
    let vMean = calculateMean(matrix[v], itemsReviewed);
    sum1 += closestNeighbours[v].sim * (matrix[closestNeighbours[v].user][item] - vMean)
    sum2 += Math.abs(closestNeighbours[v].sim)
  }
  return sum1 / sum2;
}


export function recommendedMatrix(matrix, selectedMetric, selectedPrediction, numOfNeighbours) {
  let numUsers = matrix.length;
  let numItems = matrix[0].length;
  // Vemos a qué usuarios debemos recomendar qué items
  for (let u = 0; u < numUsers; u++) {
    for (let i = 0; i < numItems; i++) {
      // Objetivo: resolver [u, i]
      if (matrix[u][i] === '-') { 
        // Calculamos las medias
        let itemsReviewedOfUser = [];
        for (let item = 0; item < numItems; item++) {
          if (matrix[u][item] !== '-') {
            itemsReviewedOfUser.push(item);
          }
        }
        // Por cada usuario con los mismos items valorados, calculamos la media
        let neighbours = [];
        for (let v = 0; v < numUsers; v++) {
          let userValid = true;
          if (v !== u) {
            for (let item = 0; item < numItems; item++) {
              // Si v no ha valorado los productos recomendados de u, este se descarta.   
              if ((matrix[v][item] === '-') && (itemsReviewedOfUser.includes(item))) {
                userValid = false;
                break;
              }
            }
            if (userValid) {
              // Calculamos la métrica correspondiente
              let sim = calculatePearsonSimilarity(u, v, itemsReviewedOfUser, matrix);
              console.log(sim);
              neighbours.push({
                user: v,
                sim: sim
              });
            }
          }
        }
        // Calculamos la predicción
        let closestNeighbours = [];
        for (let it = 0; it < numOfNeighbours; it++) {
          let max = -1;
          let closerUser = 0;
          for (let n = 0; n < neighbours.length; n++) {
            if (neighbours[n].sim >= max) {
              max = neighbours[n].sim;
              closerUser = n;
            }
          }
          closestNeighbours.push(neighbours[closerUser]);
          neighbours.splice(closerUser, 1);
        }
        console.log(closestNeighbours);
        console.log(calculateSimplePrediction(closestNeighbours, i, matrix));
        console.log(calculateMeanDiffPrediction(closestNeighbours, i, itemsReviewedOfUser, matrix));
      }
    }
  }
}