document.addEventListener('DOMContentLoaded', function () {
    let results = document.getElementById('results')
    let matrix = '';

    document.getElementById('inputMatrixToRead').addEventListener('change', function() {
      const fr = new FileReader();
      fr.onload = function() {
        matrix = fr.result
      }
      fr.readAsText(this.files[0]);
    });

    document.getElementById('doButton').addEventListener('click', function() {
      if (matrix == '') {
        results.textContent = 'Adjunta una matriz';
      } else {
        results.textContent = matrix;
      }
    });
});