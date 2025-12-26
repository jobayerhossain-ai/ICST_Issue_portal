import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[80vh]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-sky-50 p-6 rounded-full mb-6"
            >
                <Construction className="w-16 h-16 text-sky-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600 max-w-md">
                এই ফিচারটি শীঘ্রই আসছে। আমরা এটি নিয়ে কাজ করছি।
            </p>
        </div>
    );
};

export default ComingSoon;
