import { Injectable } from '@angular/core';
import { object } from '@amcharts/amcharts4/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {
  private scorePassword(pass: string): number {
    let score = 0;

    if (!pass) {
      return score;
    }

    // award every unique letter until 5 repetitions
    const letters = new Object();
    for (let i = 0; i < pass.length; i++) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    const variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass)
    };

    let variationCount = 0;

    for (const check in variations) {
      if (variations.hasOwnProperty(check)) {
        variationCount += variations[check] === true ? 1 : 0;
      }
    }

    score += (variationCount - 1) * 10;

    return parseInt(score.toString());
  }

  checkPassStrength(pass: string): string {
    const score = this.scorePassword(pass);

    if (score > 0 && score <= 40) {
      return 'სუსტი';
    }

    if (score > 40 && score <= 60) {
      return 'კარგი';
    }

    if (score > 60) {
      return 'ძლიერი';
    }

    return '';
  }
}
