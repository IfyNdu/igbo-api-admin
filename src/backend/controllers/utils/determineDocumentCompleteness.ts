import { compact } from 'lodash';
import { Record } from 'react-admin';
import { Word } from 'src/backend/controllers/utils/interfaces';

export default (record: Word | Record) : {
  sufficientWordRequirements: string[],
  completeWordRequirements: string[],
  recommendRevisiting: boolean,
} => {
  const {
    word,
    wordClass,
    definitions = [],
    isStandardIgbo,
    pronunciation,
    examples = [],
    isComplete,
    nsibidi,
    stems = [],
    synonyms = [],
    antonyms = [],
    dialects = {},
  } = record;

  const sufficientWordRequirements = compact([
    !word && 'The headword is needed',
    !word.normalize('NFD').match(/(?!\u0323)[\u0300-\u036f]/g) && 'The headword needs to have accent marks',
    !wordClass && 'The word class is needed',
    Array.isArray(definitions) && !definitions.length && 'At least one definition is needed',
    Array.isArray(examples) && !examples?.length && 'At least one example sentence is needed',
    !pronunciation && 'An audio pronunciation is needed',
    !isStandardIgbo && 'The headword needs to be marked as Standard Igbo',
  ]);

  const completeWordRequirements = compact([
    ...sufficientWordRequirements,
    !nsibidi && 'Nsịbịdị is needed',
    !stems?.length && 'A word stem is needed',
    !synonyms?.length && 'A synonym is needed',
    !antonyms?.length && 'An antonym is needed',
    (Array.isArray(examples)
      && examples.some(({ pronunciation }) => !pronunciation)
      && 'All example sentences need pronunciations'
    ),
    Object.entries(dialects) && !Object.entries(dialects).length && 'A dialectal variation is needed',
    (Object.entries(dialects)
      && Object.values(dialects).some(({ dialects, pronunciation }) => !dialects.length || !pronunciation)
      && 'All dialect variations need all fields filled'
    ),
  ]);

  /**
   * If a word is manually marked as complete, but there are criteria that haven't been
   * checked off that can be automatically checked by the platform, the platform will
   * recommend that an editor revisits the document.
   */
  const recommendRevisiting = isComplete
    && completeWordRequirements.length
    && completeWordRequirements.some((requirement) => requirement !== 'The headword needs to have accent marks');

  return {
    sufficientWordRequirements,
    completeWordRequirements,
    recommendRevisiting,
  };
};