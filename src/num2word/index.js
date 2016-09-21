/**
 * convert numbers to pretty formatted human readable sentences
 *
 *
 * example:
 *    toWords(352) -> "three hundred fifty-two"
 *
 *    toWordsOrdinal(352) -> "three hundred fifty-second"
 *
 *
 *
 *
 *
 *
 */

import {isFinite} from '../is';
import {
    TEN,
    ONE_HUNDRED,
    ONE_THOUSAND,
    ONE_MILLION,
    ONE_BILLION,
    ONE_TRILLION,
    LESS_THAN_TWENTY,
    TENTHS_LESS_THAN_HUNDRED,
    ORDINAL_LESS_THAN_THIRTEEN,
    ENDS_WITH_DOUBLE_ZERO_PATTERN,
    ENDS_WITH_TEEN_PATTERN,
    ENDS_WITH_Y_PATTERN,
    ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN
} from './constants';


/**
 * Converts an integer into words.
 * If number is decimal, the decimals will be removed.
 * @example toWords(12) => 'twelve'
 * @param {number|string} number
 * @param {boolean} asOrdinal
 * @returns {string}
 */
export default function toWords(number, asOrdinal) {
    number = parseInt(number, 10);
    if (!isFinite(number)) {
        return "Infinity";
    }

    var words = generateWords(number);
    return asOrdinal ? makeOrdinal(words) : words;
}

/**
 * Converts a number into ordinal words.
 * @example toWordsOrdinal(12) => 'twelfth'
 * @param {number|string} number
 * @returns {string}
 */
export function toWordsOrdinal(number) {
    return toWords(number, true);
}

export function toOrdinal(number) {
    var num = parseInt(number, 10);
    if (!isFinite(num)) {
        return "Infinite";
    }
    var str = String(num);
    var lastTwoDigits = num % 100;
    var betweenElevenAndThirteen = lastTwoDigits >= 11 && lastTwoDigits <= 13;
    var lastChar = str.charAt(str.length - 1);
    return str + (betweenElevenAndThirteen ? 'th'
            : lastChar === '1' ? 'st'
            : lastChar === '2' ? 'nd'
            : lastChar === '3' ? 'rd'
            : 'th');
}

function generateWords(number, words = []) {
    var remainder = 0;
    var word = "";

    // We’re done
    if (0 === number) {
        return !words.length ? 'zero' : words.join(' ').replace(/,$/, '');
    }

    // If negative, prepend “minus”
    if (number < 0) {
        words.push('minus');
        number = Math.abs(number);
    }

    if (number < 20) {
        remainder = 0;
        word = LESS_THAN_TWENTY[number];

    } else if (number < ONE_HUNDRED) {
        remainder = number % TEN;
        word = TENTHS_LESS_THAN_HUNDRED[Math.floor(number / TEN)];
        // In case of remainder, we need to handle it here to be able to add the “-”
        if (remainder) {
            word += '-' + LESS_THAN_TWENTY[remainder];
            remainder = 0;
        }

    } else if (number < ONE_THOUSAND) {
        remainder = number % ONE_HUNDRED;
        word = generateWords(Math.floor(number / ONE_HUNDRED)) + ' hundred';

    } else if (number < ONE_MILLION) {
        remainder = number % ONE_THOUSAND;
        word = generateWords(Math.floor(number / ONE_THOUSAND)) + ' thousand,';

    } else if (number < ONE_BILLION) {
        remainder = number % ONE_MILLION;
        word = generateWords(Math.floor(number / ONE_MILLION)) + ' million,';

    } else if (number < ONE_TRILLION) {
        remainder = number % ONE_BILLION;
        word = generateWords(Math.floor(number / ONE_BILLION)) + ' billion,';

    } else if (number >= ONE_TRILLION) {
        remainder = number % ONE_TRILLION;
        word = generateWords(Math.floor(number / ONE_TRILLION)) + ' trillion,';

    }

    words.push(word);

    return generateWords(remainder, words);
}


/**
 * Converts a number-word into an ordinal number-word.
 * @example makeOrdinal('one') => 'first'
 * @param {string} words
 * @returns {string}
 */
function makeOrdinal(words) {
    // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
    if (ENDS_WITH_DOUBLE_ZERO_PATTERN.test(words) || ENDS_WITH_TEEN_PATTERN.test(words)) {
        return words + 'th';
    }
    // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
    else if (ENDS_WITH_Y_PATTERN.test(words)) {
        return words.replace(ENDS_WITH_Y_PATTERN, 'ieth');
    }
    // Ends with one through twelve
    else if (ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(words)) {
        return words.replace(ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, replaceWithOrdinalVariant);
    }
    return words;
}

function replaceWithOrdinalVariant(match, numberWord) {
    return ORDINAL_LESS_THAN_THIRTEEN[numberWord];
}
