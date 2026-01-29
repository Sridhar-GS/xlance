import React from 'react';
import { Star, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../shared/components';

const GigCard = ({ gig }) => {
    return (
        <Link to={`/gigs/${gig.id}`} className="group block h-full">
            <Card hover={true} className="h-full flex flex-col overflow-hidden border-border bg-card">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                        src={gig.image}
                        alt={gig.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button className="absolute top-2 right-2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm">
                        <Heart size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                            {gig.sellerAvatar ? (
                                <img src={gig.sellerAvatar} alt="Seller" className="w-full h-full object-cover" />
                            ) : (
                                <User size={12} className="text-muted-foreground" />
                            )}
                        </div>
                        <span className="text-xs font-bold text-foreground truncate">
                            {gig.sellerName || "Seller Name"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto bg-secondary px-1.5 py-0.5 rounded">
                            Level 2
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
                        {gig.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                        <Star size={14} className="text-foreground fill-current" />
                        <span className="font-bold text-sm text-foreground">{gig.rating}</span>
                        <span className="text-muted-foreground text-sm">({gig.reviews || 0})</span>
                    </div>

                    {/* Footer: Price */}
                    <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            {/* Menu Icon or similar */}
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Starting at</span>
                            <span className="font-black text-lg text-foreground">₹{gig.price}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default GigCard;
