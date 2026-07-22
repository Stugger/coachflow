import ClientWorkoutLiveSetEditor from "./ClientWorkoutLiveSetEditor.jsx";
import ClientWorkoutRecordSetEditor from './ClientWorkoutRecordSetEditor.jsx';

function ClientWorkoutSessionSetEditor({recordMode = false, ...props}) {
    return recordMode
        ? <ClientWorkoutRecordSetEditor {...props}/>
        : <ClientWorkoutLiveSetEditor {...props}/>;
}

export default ClientWorkoutSessionSetEditor;