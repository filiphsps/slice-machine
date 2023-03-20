// @vitest-environment jsdom

import {
  describe,
  test,
  afterEach,
  beforeEach,
  expect,
  beforeAll,
  vi,
} from "vitest";
import React from "react";
import mockRouter from "next-router-mock";
import { rest } from "msw";
import SegmentClient from "analytics-node";

import SlicesIndex from "../../pages/slices";

import { render, fireEvent, act, screen, waitFor } from "../__testutils__";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

vi.mock("next/router", () => import("next-router-mock"));

describe("slices", () => {
  beforeAll(() => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockRouter.setCurrentUrl("/slices");
  });

  test("When user creates a slice it should send a tracking event", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("slice:create", () => void 0);
      },
    });
    const cwd = await createTestProject({
      adapter,
      libraries: ["slices"],
    });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.telemetry.initTelemetry();
    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    const environment = {
      framework: "next",
      changelog: {
        currentVersion: "0.0.1",
      },
    };

    const libraries = [
      {
        path: "./slices",
        isLocal: true,
        name: "slices",
        meta: {
          isNodeModule: false,
          isDownloaded: false,
          isManual: true,
        },
        components: [
          {
            from: "slices",
            href: "slices",
            pathToSlice: "./slices",
            fileName: "index",
            extension: "js",
            screenshots: {},
            mock: [
              {
                variation: "default",
                name: "Default",
                slice_type: "test_slice",
                items: [],
                primary: {
                  title: [
                    {
                      type: "heading1",
                      text: "Cultivate granular e-services",
                      spans: [],
                    },
                  ],
                  description: [
                    {
                      type: "paragraph",
                      text: "Anim in commodo exercitation qui. Elit cillum officia mollit dolore. Commodo voluptate sit est proident ea proident dolor esse ad.",
                      spans: [],
                    },
                  ],
                },
              },
            ],
            model: {
              id: "test_slice",
              type: "SharedSlice",
              name: "TestSlice",
              description: "TestSlice",
              variations: [
                {
                  id: "default",
                  name: "Default",
                  docURL: "...",
                  version: "sktwi1xtmkfgx8626",
                  description: "TestSlice",
                  primary: [
                    {
                      key: "title",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "heading1",
                          label: "Title",
                          placeholder: "This is where it all begins...",
                        },
                      },
                    },
                    {
                      key: "description",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "paragraph",
                          label: "Description",
                          placeholder: "A nice description of your feature",
                        },
                      },
                    },
                  ],
                  items: [],
                  imageUrl:
                    "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
                },
              ],
            },
            screenshotUrls: {},
          },
        ],
      },
    ];

    render(<SlicesIndex />, {
      preloadedState: {
        environment,
        slices: {
          libraries,
          remoteSlices: [],
        },
      },
    });

    const createOneButton = document.querySelector('[data-cy="create-slice"]');
    await act(async () => {
      fireEvent.click(createOneButton);
    });

    const nameInput = document.querySelector('[data-cy="slice-name-input"]');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const submitButton = screen.getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() =>
      expect(SegmentClient.prototype.track).toHaveBeenCalled()
    );

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slice Created",
        properties: {
          id: "FooBar",
          name: "FooBar",
          library: "slices",
        },
      }),
      expect.any(Function)
    );
  });

  test("if creation fails it sohuld not send the tracking event", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("slice:create", () => {
          throw new Error("forced failure");
        });
      },
    });
    const cwd = await createTestProject({
      adapter,
      libraries: ["slices"],
    });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.telemetry.initTelemetry();
    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    const environment = {
      framework: "next",
      changelog: {
        currentVersion: "0.0.1",
      },
    };

    const libraries = [
      {
        path: "./slices",
        isLocal: true,
        name: "slices",
        meta: {
          isNodeModule: false,
          isDownloaded: false,
          isManual: true,
        },
        components: [
          {
            from: "slices",
            href: "slices",
            pathToSlice: "./slices",
            fileName: "index",
            extension: "js",
            screenshots: {},
            mock: [
              {
                variation: "default",
                name: "Default",
                slice_type: "test_slice",
                items: [],
                primary: {
                  title: [
                    {
                      type: "heading1",
                      text: "Cultivate granular e-services",
                      spans: [],
                    },
                  ],
                  description: [
                    {
                      type: "paragraph",
                      text: "Anim in commodo exercitation qui. Elit cillum officia mollit dolore. Commodo voluptate sit est proident ea proident dolor esse ad.",
                      spans: [],
                    },
                  ],
                },
              },
            ],
            model: {
              id: "test_slice",
              type: "SharedSlice",
              name: "TestSlice",
              description: "TestSlice",
              variations: [
                {
                  id: "default",
                  name: "Default",
                  docURL: "...",
                  version: "sktwi1xtmkfgx8626",
                  description: "TestSlice",
                  primary: [
                    {
                      key: "title",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "heading1",
                          label: "Title",
                          placeholder: "This is where it all begins...",
                        },
                      },
                    },
                    {
                      key: "description",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "paragraph",
                          label: "Description",
                          placeholder: "A nice description of your feature",
                        },
                      },
                    },
                  ],
                  items: [],
                  imageUrl:
                    "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
                },
              ],
            },
            screenshotUrls: {},
          },
        ],
      },
    ];

    render(<SlicesIndex />, {
      preloadedState: {
        environment,
        slices: {
          libraries,
          remoteSlices: [],
        },
      },
    });

    const createOneButton = document.querySelector('[data-cy="create-slice"]');
    await act(async () => {
      fireEvent.click(createOneButton);
    });

    const nameInput = document.querySelector('[data-cy="slice-name-input"]');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const submitButton = screen.getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(SegmentClient.prototype.track).not.toBeCalled();
  });
});
