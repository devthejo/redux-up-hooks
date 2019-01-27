import {useCallback} from 'react'
import useStateFunction from './useStateFunction'

function useStateCallbackFunction(fn){
  return useStateFunction(useCallback(fn))
}

export default useStateCallbackFunction
