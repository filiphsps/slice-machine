import axios, { AxiosResponse } from "axios";
import { Slices, SliceSM } from "@slicemachine/core/build/models";
import { CheckAuthStatusResponse } from "@models/common/Auth";
import { SimulatorCheckResponse } from "@models/common/Simulator";
import {
  RenameCustomTypeBody,
  SaveCustomTypeBody,
} from "@models/common/CustomType";
import { CustomTypeMockConfig } from "@models/common/MockConfig";
import { SliceBody } from "@models/common/Slice";
import ServerState from "@models/server/ServerState";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import {
  CustomScreenshotRequest,
  ScreenshotRequest,
  ScreenshotResponse,
} from "../lib/models/common/Screenshots";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { managerClient } from "./managerClient";
import { SimulatorManagerReadSliceSimulatorSetupStepsReturnType } from "@slicemachine/core2/client";
import { pascalize, snakelize } from "@lib/utils/str";
import { CustomTypes as InternalCustomTypes } from "@prismicio/types-internal";
import { DEFAULT_VARIATION_ID } from "@lib/consts";
import { buildEmptySliceModel } from "@lib/utils/slices/buildEmptySliceModel";

const defaultAxiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/** State Routes **/

export const getState = async (): Promise<ServerState> => {
  const rawState = await managerClient.getState();

  // `rawState` from the client contains non-SM-specific models. We need to
  // transform the data to something SM recognizes.
  const state = {
    ...rawState,
    libraries: rawState.libraries.map((library) => {
      return {
        ...library,
        components: library.components.map((component) => {
          return {
            ...component,
            model: Slices.toSM(component.model),

            // Replace screnshot Blobs with URLs.
            screenshots: Object.fromEntries(
              Object.entries(component.screenshots).map(
                ([variationID, screenshot]) => {
                  return [
                    variationID,
                    {
                      ...screenshot,
                      url: URL.createObjectURL(screenshot.data),
                    },
                  ];
                }
              )
            ),
          };
        }),
      };
    }),
    customTypes: rawState.customTypes.map((customTypeModel) => {
      return CustomTypes.toSM(customTypeModel);
    }),
    remoteCustomTypes: rawState.remoteCustomTypes.map(
      (remoteCustomTypeModel) => {
        return CustomTypes.toSM(remoteCustomTypeModel);
      }
    ),
    remoteSlices: rawState.remoteSlices.map((remoteSliceModel) => {
      return Slices.toSM(remoteSliceModel);
    }),
  };

  return state;
};

/** Custom Type Routes **/

export const saveCustomType = async (
  customType: CustomTypeSM,
  mockConfig: CustomTypeMockConfig
): Promise<AxiosResponse> => {
  await managerClient.customTypes.updateCustomTypeMocksConfig({
    customTypeID: customType.id,
    mocksConfig: mockConfig,
  });

  return await managerClient.customTypes.updateCustomType({
    model: CustomTypes.fromSM(customType),
  });

  // const requestBody: SaveCustomTypeBody = {
  //   model: customType,
  //   mockConfig: mockConfig,
  // };
  //
  // return axios.post("/api/custom-types/save", requestBody, defaultAxiosConfig);
};

export const renameCustomType = (
  customType: CustomTypeSM
): Promise<AxiosResponse> => {
  return managerClient.customTypes.renameCustomType({
    model: CustomTypes.fromSM(customType),
  });
};

export const pushCustomType = async (customTypeId: string): Promise<void> => {
  await managerClient.customTypes.pushCustomType({
    id: customTypeId,
  });
};

/** Slice Routes **/
export const createSlice = async (
  sliceName: string,
  libName: string
): Promise<{ variationId: string }> => {
  const model = buildEmptySliceModel({ sliceName });

  const { errors } = await managerClient.slices.createSlice({
    libraryID: libName,
    model,
  });

  if (errors.length > 0) {
    throw new Error(
      `Failed to create Slice: ${errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  return {
    variationId: model.variations[0].id,
  };
};

export const renameSlice = async (
  slice: SliceSM,
  libName: string
): Promise<AxiosResponse> => {
  return await managerClient.slices.renameSlice({
    libraryID: libName,
    model: Slices.fromSM(slice),
  });
};

export const generateSliceScreenshotApiClient = async (
  params: ScreenshotRequest
): Promise<AxiosResponse<ScreenshotResponse>> => {
  const screenshot = await managerClient.slices.captureSliceScreenshot({
    libraryID: params.libraryName,
    sliceID: params.sliceId,
    variationID: params.variationId,
    viewport: {
      width: params.screenDimensions.width,
      height: params.screenDimensions.height,
    },
  });

  if (screenshot.data) {
    return await managerClient.slices.updateSliceScreenshot({
      libraryID: params.libraryName,
      sliceID: params.sliceId,
      variationID: params.variationId,
      data: screenshot.data,
    });
  }

  // return axios.post("/api/screenshot", params, defaultAxiosConfig);
};

export const generateSliceCustomScreenshotApiClient = (
  params: CustomScreenshotRequest
): Promise<AxiosResponse<ScreenshotUI>> => {
  return managerClient.slices.updateSliceScreenshot({
    libraryID: params.libraryName,
    sliceID: params.sliceId,
    variationID: params.variationId,
    data: params.file,
  });

  // const requestBody = form;
  // return axios.post("/api/custom-screenshot", requestBody, defaultAxiosConfig);
};

export const saveSliceApiClient = async (
  component: ComponentUI
): Promise<
  Awaited<ReturnType<typeof managerClient["slices"]["updateSlice"]>>
> => {
  await managerClient.slices.updateSliceMocksConfig({
    libraryID: component.from,
    sliceID: component.model.id,
    mocksConfig: component.mockConfig,
  });

  return await managerClient.slices.updateSlice({
    libraryID: component.from,
    model: Slices.fromSM(component.model),
  });
};

export const pushSliceApiClient = async (
  component: ComponentUI
): Promise<Record<string, string | null>> => {
  return await managerClient.slices.pushSlice({
    libraryID: component.from,
    sliceID: component.model.id,
  });

  // return axios
  //   .get<Record<string, string | null>>(
  //     `/api/slices/push?sliceName=${component.model.name}&from=${component.from}`,
  //     defaultAxiosConfig
  //   )
  //   .then((response) => response.data);
};

/** Auth Routes **/

export const startAuth = (): Promise<AxiosResponse<Record<string, never>>> =>
  axios.post("/api/auth/start", {}, defaultAxiosConfig);

export const checkAuthStatus = (): Promise<CheckAuthStatusResponse> =>
  axios
    .post("/api/auth/status", {}, defaultAxiosConfig)
    .then((r: AxiosResponse<CheckAuthStatusResponse>) => r.data);

/** Simulator Routes **/

export const checkSimulatorSetup =
  async (): Promise<SimulatorManagerReadSliceSimulatorSetupStepsReturnType> => {
    return managerClient.simulator.readSliceSimulatorSetupSteps();
  };
