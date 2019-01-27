import React from 'react'
import useStateFunction from './useStateFunction'

function useStateCallbackFunction(fn){
  return useStateFunction(React.useCallback(fn))
}

export default useStateCallbackFunction
