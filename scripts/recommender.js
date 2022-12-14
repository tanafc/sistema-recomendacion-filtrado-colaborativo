/**
 * Creates a matrix from string
 * @param {*} stringMatrix 
 * @returns the matrix
 */
export function createMatrix(stringMatrix) {
  let matrix = [];
  let numOfCols = 0;
  let numOfRows = 0;


  // Calculamos el número de filas y columnas
  let stringRowsArray = stringMatrix.split(/\r?\n|\r|\n/g);
  // Desechamos la ultima fila en caso de estar vacía
  if (stringRowsArray[stringRowsArray.length - 1] === "") {
    stringRowsArray.pop();
  }
  // Determinamos el número de filas y columnas
  numOfRows = stringRowsArray.length;
  numOfCols = stringRowsArray[0].split(" ").length;

  // Ingresamos los valores en la matriz
  for (let i = 0; i < numOfRows; i++) {
    let row = stringRowsArray[i].split(" ");
    if (row[numOfCols - 1] === "") {row.pop()};
    matrix.push(row);
  }
  
  return matrix;
}


/**
 * Calculates the mean from the reviews of items from the user
 * @param {*} reviewScores scores of the reviews from the user
 * @param {*} itemsReviewed list of items reviewed by the user
 * @returns the mean of the scores
 */
function calculateMean(reviewScores, itemsReviewed) {
  let sum = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    sum += parseFloat(reviewScores[itemsReviewed[i]]);
  }
  return sum / itemsReviewed.length;
}


/**
 * Calculates the pearson similarity between user u and v
 * @param {*} u user
 * @param {*} v user
 * @param {*} itemsReviewed items reviewed by user u
 * @param {*} matrix matrix with all the scores of the users
 * @returns the pearson similarity
 */
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


/**
 * Calculates the cosine distance between the scores of user u and v
 * @param {*} u user 
 * @param {*} v user 
 * @param {*} itemsReviewed items reviewed by user u
 * @param {*} matrix matrix with all the scores of the users
 * @returns the cosine distance
 */
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


/**
 * Calculates the euclidean distance between the scores of user u and v
 * @param {*} u user 
 * @param {*} v user 
 * @param {*} itemsReviewed items reviewed by user u
 * @param {*} matrix matrix with all the scores of the users
 * @returns the euclidean distance
 */
function calculateEuclideanDistance(u, v, itemsReviewed, matrix) {
  // Calculamos la Distancia Euclídea
  let sum = 0;
  for (let i = 0; i < itemsReviewed.length; i++) {
    sum += Math.pow(parseFloat(matrix[u][itemsReviewed[i]]) - parseFloat(matrix[v][itemsReviewed[i]]), 2);
  }
  return Math.sqrt(sum);
}


/**
 * Calculates the simple prediction of a user's scores with its neighbours
 * @param {*} closestNeighbours closest neighbours for prediction
 * @param {*} item item to predict the score
 * @param {*} matrix matrix with all the scores of the users
 * @returns the simple prediction
 */
function calculateSimplePrediction(closestNeighbours, item, matrix) {
  let sum1 = 0, sum2 = 0;
  for (let x = 0; x < closestNeighbours.length; x++) {
    sum1 += closestNeighbours[x].sim * parseFloat(matrix[closestNeighbours[x].user][item]);
    sum2 += Math.abs(closestNeighbours[x].sim);
  }
  
  return sum1 / sum2;
}


/**
 * Calculates the mean difference prediction of a user's scores with its neighbours
 * @param {*} user to predict its score of the item
 * @param {*} closestNeighbours closest neighbours for prediction
 * @param {*} item item to predict the score
 * @param {*} itemsReviewed items reviewed by the user
 * @param {*} matrix matrix with all the scores of the users
 * @returns the mean prediction
 */
function calculateMeanDiffPrediction(user, closestNeighbours, item, itemsReviewed, matrix) {
  let sum1 = 0, sum2 = 0;
  let uMean = calculateMean(matrix[user], itemsReviewed);
  for (let v = 0; v < closestNeighbours.length; v++) {
    let vMean = calculateMean(matrix[closestNeighbours[v].user], itemsReviewed);
    sum1 += closestNeighbours[v].sim * (parseFloat(matrix[closestNeighbours[v].user][item]) - vMean);
    sum2 += Math.abs(closestNeighbours[v].sim);
  }
  return uMean + sum1 / sum2;
}


/**
 * Calculates the matrix with all the recommended scores from users
 * @param {*} matrix matrix with the actual scores of the users
 * @param {*} selectedMetric metric selected to calculate the similarity
 * @param {*} selectedPrediction prediction selected to calculate the scores
 * @param {*} numOfNeighbours number of neighbours to have on account for the prediction
 * @returns the matrix calculated and the rest of parameters given as an object
 */
export function recommendedMatrix(matrix, selectedMetric, selectedPrediction, numOfNeighbours) {
  let numUsers = matrix.length;
  let numItems = matrix[0].length;
  let rMatrix = matrix;
  let similitudes = [];
  let neighboursChosed = [];
  let predictions = [];
  // Vemos a qué usuarios debemos recomendar qué items
  for (let u = 0; u < numUsers; u++) {
    for (let i = 0; i < numItems; i++) {
      // Objetivo: resolver [u, i]
      if (rMatrix[u][i] === '-') { 
        console.log(
          `Predicción de la valoración del usuario ${u + 1} sobre el producto ${i + 1}`
        );
        // Items que el usuario u ha valorado
        let itemsReviewedOfUser = [];
        for (let item = 0; item < numItems; item++) {
          if (rMatrix[u][item] !== '-') {
            itemsReviewedOfUser.push(item);
          }
        }
        // Determinamos los usuarios con los mismos items valorados y el item a valorar
        console.log(`Similitudes según métrica ${selectedMetric}:`)
        let neighbours = [];
        for (let v = 0; v < numUsers; v++) {
          let userValid = true;
          if (v !== u) {
            for (let item = 0; item < numItems; item++) {
              // Si v no ha valorado los productos recomendados de u, este se descarta.   
              if ((rMatrix[v][item] === '-') && (itemsReviewedOfUser.includes(item))) {
                userValid = false;
                break;
              }
            }
            // Si v no tiene valorado el producto i a recomendar, se descarta
            if (rMatrix[v][i] === '-') {userValid = false};

            if (userValid) {
              // Calculamos la métrica correspondiente
              let sim;
              if (selectedMetric === 'pearson') {
                sim = calculatePearsonSimilarity(u, v, itemsReviewedOfUser, rMatrix);
              } else if (selectedMetric === 'euclidean') {
                sim = calculateEuclideanDistance(u, v, itemsReviewedOfUser, rMatrix);
              } else if (selectedMetric === 'cosine') {
                sim = calculateCosineDistance(u, v, itemsReviewedOfUser, rMatrix);
              } else {
                console.log("Error: metric not valid");
              }
              console.log(`Sim(${u + 1},${v + 1}) = ${sim}`);
              // Almacenamos las similitudes con los vecinos
              neighbours.push({
                user: v,
                sim: sim
              });
            }
          }
        }
        // Almacenamos los cálculos de los vecinos en base al usuario u
        similitudes.push({
          user: u,
          neighbours: neighbours
        });
        // Calculamos los vecinos más cercanos para la predicción
        let closestNeighbours = [];
        for (let it = 0; it < numOfNeighbours; it++) {
          let max = -1;
          let nCloser = 0;
          let chosed = false;
          for (let n = 0; n < neighbours.length; n++) {
            if (neighbours[n].sim >= max) {
              max = neighbours[n].sim;
              nCloser = n;
              chosed = true;
            }
          }
          if (chosed) {
            closestNeighbours.push(neighbours[nCloser]);
            neighbours.splice(nCloser, 1);
          }
        }
        // Almacenamos el número de vecinos seleccionados
        console.log(`Vecinos seleccionados en el proceso:`);
        for (let n = 0; n < closestNeighbours.length; n++) {
          console.log(`> Usuario ${closestNeighbours[n].user + 1}`)
        }
        neighboursChosed = closestNeighbours;
        // Calculamos la predicción
        let prediction = -1;
        if (selectedPrediction === 'mean') {
          prediction = calculateMeanDiffPrediction(u, closestNeighbours, i, itemsReviewedOfUser, rMatrix);
        } else if (selectedPrediction === 'simple') {
          prediction = calculateSimplePrediction(closestNeighbours, i, rMatrix);
        } else {
          console.log('Error: prediction not valid');
        }
        rMatrix[u][i] = Math.round((prediction + Number.EPSILON) * 100) / 100;
        // Almacenamos la predicción del usuario u sobre el producto i
        console.log(`Predicción(${u + 1},${i + 1}) = ${prediction}`);
        predictions.push({
          user: u,
          item: i,
          prediction: prediction
        });
      }
    }
  }
  // Mostramos la matriz
  console.log(`Matriz de utilidad:`)
  console.log(rMatrix);

  return {
    matrix: rMatrix,
    similitudes: similitudes,
    neighboursChosed: neighboursChosed,
    predictions: predictions
  };
}