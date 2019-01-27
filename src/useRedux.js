import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import shallowEqual from './shallowEqual'
import useStateCallbackFunction from './useStateCallbackFunction'
import DefaultContext from './context'

function getStoreFromContextDefault(context){
  const {store} = useContext(context)
  return store
}

function useReduxFactory(options = {}){
  
  const {
    context : Context = DefaultContext,
    getStoreFromContext = getStoreFromContextDefault,
  } = options

  // From https://github.com/facebookincubator/redux-react-hook/blob/0e9791f028a157ed863cdc7c61836e77e03b0e43/src/index.ts
  // with added support for dependencies
  // and add runtime context option
  function useMappedState(mapState, dependencies = [], context = Context){
    const store = getStoreFromContext(context)
    const runMapState = () => mapState(store.getState())

    const [derivedState, setDerivedState] = useState(() => runMapState())

    // If the store or mapState change, rerun mapState
    const [prevStore, setPrevStore] = useState(store)
    const [prevMapState, setPrevMapState] = useState(() => mapState)
    if (prevStore !== store || prevMapState !== mapState) {
      setPrevStore(store)
      setPrevMapState(() => mapState)
      setDerivedState(runMapState())
    }

    // We use a ref to store the last result of mapState in local component
    // state. This way we can compare with the previous version to know if
    // the component should re-render. Otherwise, we'd have pass derivedState
    // in the array of memoization paramaters to the second useEffect below,
    // which would cause it to unsubscribe and resubscribe from Redux every time
    // the state changes.
    const lastRenderedDerivedState = useRef(derivedState)
    // Set the last mapped state after rendering.
    useEffect(() => {
      lastRenderedDerivedState.current = derivedState
    })

    useEffect(
      () => {
        // Run the mapState callback and if the result has changed, make the
        // component re-render with the new state.
        const checkForUpdates = () => {
          const newDerivedState = runMapState()
          if (!shallowEqual(newDerivedState, lastRenderedDerivedState.current)) {
            
            // https://github.com/facebookincubator/redux-react-hook/issues/17
            // https://github.com/ctrlplusb/easy-peasy/blob/master/src/hooks.js
            setImmediate(()=>{
              setDerivedState(newDerivedState)
            })
          }
        }

        // Pull data from the store on first render.
        checkForUpdates()

        // Subscribe to the store to be notified of subsequent changes.
        const unsubscribe = store.subscribe(checkForUpdates)

        // The return value of useEffect will be called when unmounting, so
        // we use it to unsubscribe from the store.
        return unsubscribe
      },
      [store, mapState, ...dependencies],
    )

    return derivedState
  }

  function useDispatch(context = Context) {
    const store = getStoreFromContext(context)
    return store.dispatch
  }
  
  function useSelector(mapState, dependencies = [], context = Context) {
    return useMappedState(mapState, dependencies, context)
  }

  // API inspired from https://github.com/ctrlplusb/easy-peasy
  function useStore(mapState, dependencies = [], context = Context) {
    const [cachedMapState] = useStateCallbackFunction(mapState)
    return useMappedState(cachedMapState, dependencies, context)
  }

  function useAction(mapActions, dependencies = [], context = Context) {
    // return mapActions(useDispatch(context))
    // return useMemo(mapActions(useDispatch(context)), dependencies)
    return useCallback(mapActions, dependencies)(useDispatch(context))
  }
  
  function useContextStore(context, mapState, dependencies = []){
    return useStore(mapState, dependencies, context)
  }
  function useContextAction(context, mapActions, dependencies = []){
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
  }
}


const useRedux = useReduxFactory()

const {
  useStore,
  useAction,
  useContextStore,
  useContextAction,
  useSelector,
  useDispatch,
  useMappedState,
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
  useReduxFactory,
}
