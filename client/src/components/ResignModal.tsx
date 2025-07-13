import ConfirmationModal from './ConfirmationModal'

const ResignModal = ({ resignModal, onResignConfirm, closeResignModal }: { resignModal: boolean, onResignConfirm: () => void, closeResignModal: () => void }) => {
    return (
        <div>{resignModal && (
            <ConfirmationModal
                text="Do You want to Resign?"
                buttons={[
                    {
                        text: "Yes",
                        func: onResignConfirm,
                    },
                    {
                        text: "No",
                        func: closeResignModal,
                    },
                ]}
            />
        )}</div>
    )
}

export default ResignModal