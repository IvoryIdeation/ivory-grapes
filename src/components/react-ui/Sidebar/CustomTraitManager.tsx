import * as React from 'react';
import { TraitsResultProps } from '@grapesjs/react';
import TraitPropertyField from './utils/TraitPropertyField';

export default function CustomTraitManager({ traits }: Omit<TraitsResultProps, 'Container'>) {
    return (
      <div className="gjs-custom-style-manager text-left mt-3 p-1">
        {
        !traits.length ?
            <div>No properties available</div>
        :
        traits.map(trait => (
            <TraitPropertyField key={trait.getId()} trait={trait}/>
        ))}
      </div>
    );
  }