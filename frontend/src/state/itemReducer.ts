import { BasicItem } from "@/lib/types";
import { AxiosError } from "axios";

interface ChildItemsState {
  childItems: BasicItem[];
  childLoading: boolean;
  childError: AxiosError | null;
}

export const SET_CHILD_ITEMS = "SET_CHILD_ITEMS";
export const SET_CHILD_LOADING = "SET_CHILD_LOADING";
export const CLEAR_CHILD_ITEMS = "CLEAR_CHILD_ITEMS";
export const SET_CHILD_ERROR = "SET_CHILD_ERROR";

interface SetChildItemsAction {
  type: typeof SET_CHILD_ITEMS;
  payload: BasicItem[];
}

interface SetChildLoadingAction {
  type: typeof SET_CHILD_LOADING;
  payload: boolean;
}

interface ClearChildItemsAction {
  type: typeof CLEAR_CHILD_ITEMS;
}

interface SetChildErrorAction {
  type: typeof SET_CHILD_ERROR;
  payload: AxiosError | null;
}

type ChildItemsAction =
  | SetChildItemsAction
  | SetChildLoadingAction
  | ClearChildItemsAction
  | SetChildErrorAction;

export function childItemsReducer(
  state: ChildItemsState,
  action: ChildItemsAction
): ChildItemsState {
  switch (action.type) {
    case SET_CHILD_ITEMS:
      return { ...state, childItems: action.payload, childLoading: false };
    case SET_CHILD_LOADING:
      return { ...state, childLoading: action.payload };
    case CLEAR_CHILD_ITEMS:
      return { ...state, childItems: [], childLoading: false };
    case SET_CHILD_ERROR:
      return { ...state, childError: action.payload, childLoading: false };
    default:
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
  }
}

export const initialChildItemsState: ChildItemsState = {
  childItems: [],
  childLoading: false,
  childError: null,
};
