import { Flex, ThemeUICSSObject } from "theme-ui";

const FullPage: React.FC<{ sx?: ThemeUICSSObject }> = ({ children, sx }) => (
  <Flex
    sx={{
      bg: "grey01",
      height: "90%",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1",
      ...sx,
    }}
  >
    <Flex
      sx={{
        marginTop: "-128px",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </Flex>
  </Flex>
);

export default FullPage;
