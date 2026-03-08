//algorithm that compares guess and returns green/yellow/grey for each letter
// difficult logic part: assigning the colour for the letters, and duplicate letters part.

//we will be using two pass algorithm:
/*
  pass 1: find all the exact matches(green) first
      : Go through every position. If guess[] === solution[i] mark it green, also
            'consume' that letter from the solution- so that it can't be matched again
  pass 2: find wrong positions matched(yellow)
      : only looking at the letter NOT already marked green. For each letter, check if it exists anywhere in the remaining(unconsumed) solution.
 */

export function evaluateGuess(guess, solution) {
  // Will return array of { letter, status } objects
  // Status: 'correct' | 'present' | 'absent'

  const result = Array(5).fill(null).map((_, i) => ({
    letter: guess[i], 
    status: 'absent',   //default everything with grey
  }));

  //mutable copies so that we can consume letters
  const solutionLetters = solution.split('');   //letters of the answer
  const guessLetters = guess.split('');         //letters of the guessed answer

  //Pass 1
  guessLetters.forEach((letter, i) => {
    if (letter === solutionLetters[i]){
      result[i].status = 'correct';
      solutionLetters[i] = null;
      guessLetters[i] = null;
    }
  });

  //Pass 2
  guessLetters.forEach((letter, i) =>{
    if(letter === null) return;                 //skipping the already green letter

    const matchIndex = solutionLetters.indexOf(letter);

    if(matchIndex !== -1){
      result[i].status = 'present'    //yellow
      solutionLetters[matchIndex] = null;     //consume so next duplicate can't reuse it
    }
    // else the status remains 'absent'
  });
  return result;
}