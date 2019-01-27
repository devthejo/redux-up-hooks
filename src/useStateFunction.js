import {useState} from 'react'

function useStateFunction(fn) {
  const [val, setVal] = useState(() => fn)
  function setFunc(fn) {
    setVal(() => fn)
  }
  return [val, setFunc]
}
export default useStateFunction
