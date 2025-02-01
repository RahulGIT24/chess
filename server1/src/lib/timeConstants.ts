export function timeConv(time: string):number|null {
    if(time){
        const minutes = parseInt(time.split(" ")[0]);
        return minutes*60;
    }
    return null
}