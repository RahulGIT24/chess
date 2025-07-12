export function minutesToMilliseconds(time: string):number|null {
    if(time){
        const minutes = parseInt(time.split(" ")[0]);
        return minutes*60*1000;
    }
    return null
}