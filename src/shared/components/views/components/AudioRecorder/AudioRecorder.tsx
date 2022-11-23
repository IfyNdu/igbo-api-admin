import React, { ReactElement, useEffect, useState } from 'react';
import { has, get } from 'lodash';
import { Record } from 'react-admin';
import ReactAudioPlayer from 'react-audio-player';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { DEFAULT_EXAMPLE_RECORD, DEFAULT_WORD_RECORD } from 'src/shared/constants';
import { Example, Word } from 'src/backend/controllers/utils/interfaces';
import useRecorder from 'src/hooks/useRecorder';
import FormHeader from '../FormHeader';

const convertToTime = (seconds) => new Date(seconds * 1000).toISOString().slice(14, 19);
const AudioRecorder = ({
  path,
  getFormValues,
  setPronunciation,
  record,
  originalRecord: originalRecordProp,
  formTitle,
  formTooltip,
}: {
  path: string,
  getFormValues: (key: string) => any,
  setPronunciation: (path: string, value: any) => any,
  record: Record | Example | Word,
  originalRecord: Record,
  formTitle?: string,
  formTooltip?: string,
}): ReactElement => {
  const originalRecord = record.originalWordId || record.originalExampleId
    ? originalRecordProp
    : record?.associatedWords
      ? DEFAULT_EXAMPLE_RECORD
      : DEFAULT_WORD_RECORD;
  const pathLabel = path === 'headword'
    ? 'Standard Igbo'
    : path.startsWith('examples') // Handles path for nested examples
      ? 'Example'
      : path;
  const valuePath = path === 'headword'
    ? 'pronunciation'
    : path.startsWith('examples')
      ? 'pronunciation'
      : `${path}.pronunciation`;
  const formValuePath = path === 'headword'
    ? 'pronunciation'
    : path.startsWith('examples') // Handles path for nested examples
      ? `${path}.pronunciation`
      : `${path}.pronunciation`;
  const [pronunciationValue, setPronunciationValue] = useState(null);
  const [audioBlob, isRecording, startRecording, stopRecording, recordingDuration] = useRecorder();
  const toast = useToast();

  /* Resets the audio pronunciation to its original value */
  const resetRecording = () => {
    const pronunciationPath = valuePath;
    const originalPronunciationValue = path === 'headword'
      ? originalRecord.pronunciation
      : originalRecord[`${pronunciationPath}`];
    setPronunciation(formValuePath, originalPronunciationValue);
    setPronunciationValue(getFormValues(formValuePath));
    toast({
      title: 'Reset Audio Pronunciation',
      description: 'The audio pronunciation for this slot has been reset to its original value',
      status: 'info',
      duration: 9000,
      isClosable: true,
    });
  };

  const shouldRenderNewPronunciationLabel = () => {
    const currentPronunciationPath = getFormValues(valuePath);
    return currentPronunciationPath && currentPronunciationPath.startsWith('data');
  };

  const renderStatusLabel = () => (
    <Box className="text-center flex flex-row justify-center">
      {pronunciationValue && !isRecording ? (
        <Box className="flex flex-col">
          <ReactAudioPlayer
            data-test={`${path}-audio-playback`}
            style={{ height: 40, width: 250 }}
            id="audio"
            src={pronunciationValue}
            controls
          />
          {shouldRenderNewPronunciationLabel() && (
            <span className="text-green-500 mt-2">New pronunciation recorded</span>
          )}
        </Box>
      ) : <span className="text-gray-700 italic">No audio pronunciation</span>}
    </Box>
  );

  /* Grabbing the default pronunciation value for the word or example document */
  useEffect(() => {
    if (has(record, 'pronunciation') && !pronunciationValue) {
      setPronunciationValue(get(record, valuePath));
    }
  }, [record]);

  /** Listen to changes to the audioBlob for the
   * current pronunciation and saves it. If getFormValues
   * doesn't have a pronunciation key living on the object yet,
   * the platform will not overwrite the pronunciationValue
   * with undefined.
   * */
  useEffect(() => {
    const base64data = audioBlob;
    if (base64data) {
      setPronunciation(formValuePath, base64data);
      setPronunciationValue(getFormValues(formValuePath));
    }
    if (base64data) {
      toast({
        title: 'Recorded new audio',
        description: `A new audio pronunciation for 
        ${pathLabel} has been recorded`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [audioBlob]);

  return (
    <Box className="flex flex-col w-full my-2">
      <FormHeader
        title={formTitle}
        tooltip={formTooltip}
      />
      <Box
        data-test="word-pronunciation-input-container"
        width="fit-content"
        backgroundColor="gray.200"
        borderRadius="md"
        p={3}
      >
        <Box className="flex flex-col justify-center items-center w-full lg:space-x-4">
          {!isRecording ? (
            <Box className={`flex flex-row justify-center
            ${pronunciationValue ? 'items-start' : 'items-center'} space-x-3`}
            >
              <Tooltip label="Start recording">
                <Button
                  borderRadius="full"
                  borderColor="gray.300"
                  borderWidth="3px"
                  backgroundColor="white"
                  height="44px"
                  width="44px"
                  _hover={{
                    backgroundColor: 'gray.100',
                  }}
                  _active={{
                    backgroundColor: 'gray.100',
                  }}
                  padding="0px"
                  data-test={`start-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  className="flex justify-center items-start"
                  onClick={startRecording}
                >
                  <Box height="10px" width="10px" borderRadius="full" backgroundColor="red.600" />
                </Button>
              </Tooltip>
              {renderStatusLabel()}
              <Tooltip label="Reset recording">
                <IconButton
                  aria-label="Reset recording"
                  icon={<RepeatIcon color="gray.600" />}
                  data-test={`reset-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  backgroundColor="gray.300"
                  onClick={resetRecording}
                  borderRadius="full"
                  _hover={{
                    backgroundColor: 'gray.400',
                  }}
                  variant="ghost"
                />
              </Tooltip>
            </Box>
          ) : (
            <Box>
              <Box className="flex flex-row justify-center items-center space-x-3">
                <Button
                  borderRadius="full"
                  borderColor="gray.300"
                  borderWidth="3px"
                  backgroundColor="white"
                  height="50px"
                  width="50px"
                  _hover={{
                    backgroundColor: 'gray.100',
                  }}
                  _active={{
                    backgroundColor: 'gray.100',
                  }}
                  padding="0px"
                  data-test={`stop-recording-button${path === 'headword' ? '' : `-${path}`}`}
                  className="flex justify-center items-center"
                  onClick={stopRecording}
                >
                  <Box height="12px" width="12px" backgroundColor="gray.600" />
                </Button>
                <canvas id="canvas" height={60} width={150} className="mb-3" />
              </Box>
              <Box style={{ fontFamily: 'monospace' }} className="w-full flex flex-row justify-center items-center">
                {convertToTime(recordingDuration)}
              </Box>
              {renderStatusLabel()}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

AudioRecorder.defaultProps = {
  formTitle: 'Word Pronunciation',
  formTooltip: 'Record the audio for the headword only one time. You are able to record over pre-existing recordings.',
};

export default AudioRecorder;
