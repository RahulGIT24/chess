import Button from "./Button"

interface ButtonArr {
    text:string,
    func:any,
    className?:string
}

type ConfimationProps = {
    text: string,
    buttons: ButtonArr[]
}

const ConfirmationModal = ({ text, buttons }: ConfimationProps) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white text-black bg-opacity-50 z-50">
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
                <h2 className="text-xl font-bold text-center mb-4">{text}</h2>
                <div className="flex justify-center items-center gap-x-6">
                    {
                        buttons.map((b,i)=>(
                            <Button key={i} onClick={b.func} classname={`w-48 ` +b.className}>{b.text}</Button>
                        ))
                    }
                    {/* <Button onClick={() => { func(false) }} classname="w-48">No</Button> */}
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal