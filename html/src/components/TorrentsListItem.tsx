import { CircularProgress, CircularProgressLabel, Flex, Grid, GridItem, HStack, Icon, IconButton, Menu, MenuButton, Text, useColorMode } from "@chakra-ui/react";
import { filesize } from "filesize";
import { IconType } from "react-icons/lib";
import { MdFileCopy, MdFolderOpen, MdOutlineMoreVert } from "react-icons/md";
import { Torrent } from "../types"

type TorrentsListItemProps = {
  torrent: Torrent;
}

type KeyValueProps = {
  icon: IconType;
  value: any;
}

function checkBit(flags: number, bit: number) {
  return (flags & (1<<bit)) === 1<<bit;
}

function isAutoManaged(flags: number) {
  return checkBit(flags, 5);
}

function isPaused(flags: number) {
  return (flags & (1<<4)) === 1<<4;
}

function stateColor(torrent: Torrent) {
  if (torrent.error) {
    return "red";
  }

  switch (torrent.state) {
    case 3: return "blue.500";
    case 5: return "green.300";
  }
  return "default";
}

function stateString(torrent: Torrent) {
  if (torrent.error) {
    return "error";
  }

  switch (torrent.state) {
    case 1: {
      if (isPaused(torrent.flags)) {
        return "checking_files_queued";
      }
      return "checking_files";
    }
    case 2: return "downloading_metadata";
    case 3: {
      if (isPaused(torrent.flags)) {
        if (isAutoManaged(torrent.flags)) {
          return "queued";
        }
        return "paused";
      }
      return "downloading";
    }
    case 4: return "finished";
    case 5: {
      if (isPaused(torrent.flags)) {
        if (isAutoManaged(torrent.flags)) {
          return "seeding_queued";
        }
        return "finished";
      }
      return "seeding";
    }
  }
  return "unknown";
}

function KeyValue(props: KeyValueProps) {
  return (
    <Flex
      alignItems={"center"}
    >
      <Icon
        as={props.icon}
      />
      <Text ms={1}>{props.value}</Text>
    </Flex>
  )
}

export default function TorrentsListItem(props: TorrentsListItemProps) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Grid
      gridTemplateColumns={"32px calc(100% - 220px - 80px) 110px 110px 48px"}
      gridTemplateRows={"0fr"}
      templateAreas={`
        "progress main dl actions"
      `}
    >
      <GridItem alignSelf={"center"}>
        <CircularProgress
          color={stateColor(props.torrent)}
          size={"32px"}
          value={props.torrent.progress * 100}
        >
          <CircularProgressLabel>{Math.round(props.torrent.progress*100)}%</CircularProgressLabel>
        </CircularProgress>
      </GridItem>

      <GridItem m={2}>
        <Text
          overflow={"hidden"}
          overflowWrap={"anywhere"}
          textOverflow={"ellipsis"}
          whiteSpace={"nowrap"}
          wordBreak={"break-all"}
        >
          {props.torrent.name}
        </Text>
        <HStack
        >
          <HStack
            color={colorMode === "dark" ? "whiteAlpha.600" : "blackAlpha.600"}
            fontSize={"sm"}
          >
            <KeyValue icon={MdFolderOpen} value={props.torrent.save_path} />
            {props.torrent.size > 0 && (
              <KeyValue icon={MdFileCopy} value={filesize(props.torrent.size).toString()} />
            )}
          </HStack>
        </HStack>
      </GridItem>

      <GridItem alignSelf={"center"} textAlign={"end"}>
        <Text fontSize={"sm"} mx={2}>
          {props.torrent.download_rate > 1024
            ? <>{filesize(props.torrent.download_rate).toString()}/s</>
            : <Text color={"gray.500"}>-</Text>
          }
        </Text>
      </GridItem>

      <GridItem alignSelf={"center"} textAlign={"end"}>
        <Text fontSize={"sm"} mx={2}>
          {props.torrent.upload_rate > 1024
            ? <>{filesize(props.torrent.upload_rate).toString()}/s</>
            : <Text color={"gray.500"}>-</Text>
          }
        </Text>
      </GridItem>

      <GridItem alignSelf={"center"} textAlign={"end"}>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<MdOutlineMoreVert />}
            size={"sm"}
          />
        </Menu>
      </GridItem>
    </Grid>
  )
}
