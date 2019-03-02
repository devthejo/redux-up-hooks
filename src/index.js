import {createContext, useContext, useEffect, useRef, useState, useCallback, useMemo} from 'react'
import shallowEqual from './shallowEqual'
import useStateCallbackFunction from './useStateCallbackFunction'

function getStoreFromContextDefault(context){
  const value = useContext(context)
  return value.store || value
}

function create(options = {}){

  const {
    context : StoreContext = createContext(),
    getStoreFromContext = getStoreFromContextDefault,
  } = options

  // From https://github.com/facebookincubator/redux-react-hook/blob/0e9791f028a157ed863cdc7c61836e77e03b0e43/src/index.ts
  // with added support for dependencies
  // and add runtime context option
  function useMappedState(mapState, dependencies = [], context = StoreContext){
    const store = getStoreFromContext(context)

    const runMapState = () => mapState(store.getState())

    const [derivedState, setDerivedState] = useState(runMapState)

    // If the store or mapState change, rerun mapState
    const lastStore = useRef(store)
    const lastMapState = useRef(mapState)

    // We keep lastDerivedState in a ref and update it imperatively
    // after calling setDerivedState so it's always up-to-date.
    // We can't update it in useEffect because state might be updated
    // synchronously multiple times before render occurs.
    const lastDerivedState = useRef(derivedState)

    const wrappedSetDerivedState = () => {
      const newDerivedState = runMapState()
      if (!shallowEqual(newDerivedState, lastDerivedState.current)) {
        setDerivedState(newDerivedState)
        lastDerivedState.current = newDerivedState
      }
    }

    if (lastStore.current !== store || lastMapState.current !== mapState) {
      lastStore.current = store
      lastMapState.current = mapState
      wrappedSetDerivedState()
    }

    useEffect(
      () => {
        let didUnsubscribe = false

        // Run the mapState callback and if the result has changed, make the
        // component re-render with the new state.
        const checkForUpdates = () => {
          if (didUnsubscribe) {
            // Don't run stale listeners.
            // Redux doesn't guarantee unsubscriptions happen until next dispatch.
            return
          }

          wrappedSetDerivedState()
        }

        // Pull data from the store after first render in case the store has
        // changed since we began.
        checkForUpdates()

        // Subscribe to the store to be notified of subsequent changes.
        const unsubscribe = store.subscribe(checkForUpdates)

        // The return value of useEffect will be called when unmounting, so
        // we use it to unsubscribe from the store.
        return () => {
          didUnsubscribe = true
          unsubscribe()
        }
      },
      [store, mapState, ...dependencies],
    )

    return derivedState
  }

  function useDispatch(context = StoreContext) {
    const store = getStoreFromContext(context)
    return store.dispatch
  }

  function useSelector(mapState, dependencies = [], context = StoreContext) {
    return useMappedState(mapState, dependencies, context)
  }

  // API inspired from https://github.com/ctrlplusb/easy-peasy
  function useStore(mapState, dependencies = [], context = StoreContext) {
    const [cachedMapState] = useStateCallbackFunction(mapState)
    return useMappedState(cachedMapState, dependencies, context)
  }

  function useAction(mapActions, dependencies = [], context = StoreContext) {
    const store = getStoreFromContext(context)
    return useCallback(mapActions, [store, mapActions, ...dependencies])(store.dispatch)
  }

  function useContextStore(context, mapState, dependencies = []){
    return useStore(mapState, dependencies, context)
  }
  function useContextAction(context, mapActions, dependencies){
    return useAction(mapActions, dependencies, context)
  }

  return {
    useStore,
    useAction,
    useContextStore,
    useContextAction,
    useSelector,
    useDispatch,
    useMappedState,
    StoreContext,
  }
}


const useRedux = create()

const {
  useStore,
  useAction,
  useContextStore,
  useContextAction,
  useSelector,
  useDispatch,
  useMappedState,
  StoreContext,
} = useRedux


export default useRedux

export {
  useStore,
  useAction,
  useContextStore,
  useContextAction,
  useSelector,
  useDispatch,
  useMappedState,
  create,
  StoreContext,
}
