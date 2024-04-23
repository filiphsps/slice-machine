import { Button } from "@prismicio/editor-ui";
import { Box, Heading, Text } from "theme-ui";

const ZoneEmptyState = ({
  onEnterSelectMode,
  zoneName,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onEnterSelectMode: Function;
  zoneName: string;
}) => (
  <Box sx={{ textAlign: "center", my: 4 }}>
    <Heading as="h5">Add a new field here</Heading>
    <Box sx={{ my: 2 }}>
      <Text sx={{ color: "textClear" }}>
        Fields are inputs for content (e.g. text, images, links).
      </Text>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
      <Button
        color="grey"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        onClick={() => onEnterSelectMode()}
        data-testid={`add-${zoneName}-field`}
        startIcon="add"
      >
        Add a new field
      </Button>
    </Box>
  </Box>
);

export default ZoneEmptyState;