import React from 'react'

function useStateFunction(fn) {
  const [val, setVal] = React.useState(() => fn)
  function setFunc(fn) {
    setVal(() => fn)
  }
  return [val, setFunc]
}
export default useStateFunction
