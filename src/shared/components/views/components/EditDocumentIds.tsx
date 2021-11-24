import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { DocumentIdsProps } from '../../../interfaces';

const EditDocumentIds = ({
  collection,
  originalId,
  id,
  title,
}: DocumentIdsProps): ReactElement => (
  <Box className="flex flex-col my-2">
    <Box className="flex items-center">
      <Heading fontSize="lg" className="text-l text-gray-600 mr-3">Id:</Heading>
      <Text fontSize="lg" className="text-l text-gray-800">{id}</Text>
    </Box>
    <Box className="flex items-center">
      <Heading fontSize="lg" className="text-l text-gray-600 mr-3">{title}</Heading>
      <Text fontSize="lg" className="text-l text-gray-800">
        {originalId ? (
          <a
            className="link"
            href={`#/${collection}/${originalId}/show`}
          >
            {originalId}
          </a>
        ) : (
          'N/A'
        )}
      </Text>
    </Box>
  </Box>
);

export default EditDocumentIds;
