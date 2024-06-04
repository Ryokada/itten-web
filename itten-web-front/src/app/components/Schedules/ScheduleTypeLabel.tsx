import scheduleTypes from '../../member/schedule/scheduleTypes';

type ScheduleTypeLabelProps = {
    /**
     * 種別のID
     */
    typeId: string;
};

/**
 * スケジュールの種類を表示するラベル
 *
 */
const ScheduleTypeLabel = ({ typeId }: ScheduleTypeLabelProps) => {
    if (!typeId) {
        return <div className='mb-2 border rounded border-slate-500 w-max px-1 text-sm'>不明</div>;
    }
    return (
        <div className='mb-2 border rounded border-slate-500 w-max px-1 text-sm'>
            {scheduleTypes[typeId]}
        </div>
    );
};

export default ScheduleTypeLabel;
