import { DropZone, BlockStack, Thumbnail, Text } from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';
import Papa from 'papaparse';

export default function OrderInput(props) {
  const [files, setFiles] = useState([]);
 const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFiles((files) => [...acceptedFiles]);

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === 'text/csv') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target.result;
            const parsedData = Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
            }).data;
           props.handle(parsedData);
            // Log the JSON data
          };
          reader.readAsText(file);
        }
      }
    },
    []
  );

  const validImageTypes = ['text/csv'];

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .csv" />
  );

  const uploadedFiles = files.length > 0 && (
    <BlockStack vertical={true}>
      <BlockStack alignment="center">
        <Thumbnail
          size="small"
          alt={files[0].name}
          source={
            validImageTypes.includes(files[0].type)
              ? window.URL.createObjectURL(files[0])
              : NoteIcon
          }
        />
        <div>
          {files[0].name}{' '}
          <Text variant="bodySm" as="p">
            {files[0].size} bytes
          </Text>
        </div>
      </BlockStack>
     
    </BlockStack>
  );

  return (
    <DropZone onDrop={handleDropZoneDrop} variableHeight>
      {uploadedFiles}
      {fileUpload}
    </DropZone>
  );
}
