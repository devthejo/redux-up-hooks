import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import shallowEqual from './shallowEqual'
import useStateCallbackFunction from './useStateCallbackFunction'
import StoreContext from './context'

function getStoreFromContextDefault(context){
  const value = useContext(context)
  return value.store || value
}

function useReduxFactory(options = {}){
  
  const {
    context : Context = StoreContext,
    getStoreFromContext = getStoreFromContextDefault,
  } = options

  // From https://github.com/facebookincubator/redux-react-hook/blob/0e9791f028a157ed863cdc7c61836e77e03b0e43/src/index.ts
  // with added support for dependencies
  // and add runtime context option
  function useMappedState(mapState, dependencies = [], context = Context){
    const store = getStoreFromContext(context)
    
    const mapStateFactory = () => mapState
    const runMapState = () => mapState(store.getState())
    
    const [derivedState, setDerivedState] = useState(runMapState)

    // If the store or mapState change, rerun mapState
    const [prevStore, setPrevStore] = useState(store)
    
    const [prevMapState, setPrevMapState] = useState(mapStateFactory)

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
    
    if (prevStore !== store || prevMapState !== mapState) {
      setPrevStore(store)
      setPrevMapState(mapStateFactory)
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
  StoreContext,
}
